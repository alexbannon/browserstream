'use strict';
// var _ = require('lodash');
var Config = require('../../config/environment/config.js');
var config = new Config();
var pg = require('pg');
var util = require('util');
var redis = require('redis');
var redisClient = redis.createClient();


function requestStreams(providers, titleType, sort, offset, limit, genres, callback) {
  offset = (isNaN(parseInt(offset))) ? 0 : offset;
  var queryValues = [];
  var providersParametersArray = [];
  var allowedProviders = ['netflix', 'hbo_go', 'amazon_prime', 'hulu'];
  var count = 1;
  providers.forEach((element) => {
    if (allowedProviders.indexOf(element) === -1) { return; }
    providersParametersArray.push(('$' + (count)));
    queryValues.push(element);
    count++;
  });
  var providerParams = providersParametersArray.join(', ');
  providerParams = '(' + providerParams + ')';

  var titleTypeParametersArray = [];
  var allowedTitleTypes = ['movie', 'series', 'episode'];
  titleType.forEach((element) => {
    if (allowedTitleTypes.indexOf(element) === -1) { return; }
    titleTypeParametersArray.push(('$' + (count)));
    queryValues.push(element);
    count++;
  });
  var titleTypeParams = titleTypeParametersArray.join(', ');
  titleTypeParams = '(' + titleTypeParams + ')';

  var sortQuery;
  switch (sort) {
    case 'best':
      sortQuery = 'imdb_rating DESC';
      break;
    case 'worst':
      sortQuery = 'imdb_rating ASC';
      break;
    case 'alphabetical':
      sortQuery = 't.title_name ASC';
      break;
    default:
      sortQuery = 'imdb_rating DESC';
  }
  var genresInsert = '';
  if (genres) {
    var genresArray = [];
    var allowedGenres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Romance', 'Mystery', 'Crime', 'Family', 'Sci-Fi', 'Fantasy', 'Horror', 'Thriller'];
    genres.forEach((element) => {
      if (allowedGenres.indexOf(element) === -1) { return; }
      genresArray.push(element);
    });
    if (genresArray.length > 0) {
      genresInsert = 'AND t.genre SIMILAR TO $' + count;
      var genreValue = '%(';
      for (var i = 0; i < genresArray.length; i++) {
        genreValue += genresArray[i] + '|';
      }
      genreValue = genreValue.substring(0, genreValue.length - 1);
      genreValue += ')%';
      queryValues.push(genreValue);
    }

  }

  var query = `SELECT t.title_id, t.title_name, t.imdb_id, t.image_url, t.imdb_rating, array_agg( p.provider_id ) as providers_ids, array_agg( p.name ) as providers_names FROM provider_title as pt JOIN provider as p ON pt.provider_id = p.provider_id JOIN title as t ON t.title_id = pt.title_id WHERE p.name IN ${providerParams} AND t.type IN ${titleTypeParams} ${genresInsert} GROUP BY t.title_id, t.title_name ORDER BY ${sortQuery} NULLS LAST LIMIT ${limit} OFFSET ${offset};`;
  pg.connect(config.POSTGRES_CONNECT, function(err, client, done) {
    if (err) {
      callback('could not connect to postgres db');
      return;
    }
    client.query(query, queryValues, function(err, result) {
      done();
      if (err) {
        callback(err);
      } else {
        if (callback) {
          callback(err, result);
        }
      }
      pg.end();
    });
  });
}

var validatorSchema = {
  'sort': {
    notEmpty: true,
    matches: {
      options: ['^(best|worst|alphabetical)', 'i']
    }
  },
  'start': {
    notEmpty: true,
    isInt: {
      errorMessage: 'Start Param Not Integer'
    }
  },
  'providers': {
    notEmpty: true,
    isArray: {
      errorMessage: 'Providers is not an array'
    },
    eachIsProvider: {
      errorMessage: 'At Least One Provider Invalid'
    }
  },
  'titletype': {
    notEmpty: true,
    isArray: {
      errorMessage: 'titletype is not an array'
    },
    eachIsTitleType: {
      errorMessage: 'At Least One TitleType Invalid'
    }
  },
  'limit': {
    notEmpty: true,
    isInt: {
      errorMessage: 'limit is not an integer'
    }
  },
  'genre': {
    isArray: {
      errorMessage: 'genres is not an array'
    },
    eachIsGenre: {
      errorMessage: 'At Least One Genre Invalid'
    }
  }
};

exports.index = function (req, res) {
  if (typeof req.query.providers === 'string') {
    req.query.providers = [req.query.providers];
  }
  if (typeof req.query.titletype === 'string') {
    req.query.titletype = [req.query.titletype];
  }
  req.query.genre = req.query.genre || [];
  if (typeof req.query.genre === 'string') {
    req.query.genre = [req.query.genre];
  }
  req.checkQuery(validatorSchema);
  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
      return;
    }
    var cacheKey = 'cachekey-redis-';
    req.query.providers.sort();
    req.query.titletype.sort();
    req.query.genre.sort();
    for (var i = 0; i < req.query.providers.length; i++) {
      cacheKey += req.query.providers[i];
    }
    for (var x = 0; x < req.query.titletype.length; x++) {
      cacheKey += req.query.titletype[x];
    }
    for (var y = 0; y < req.query.genre.length; y++) {
      cacheKey += req.query.genre[y];
    }
    cacheKey += req.query.sort;
    cacheKey += req.query.limit;
    cacheKey += req.query.start;
    redisClient.get(cacheKey, function(err, result) {
      if (result) {
        res.header('Cache-Control', 'max-age=3600, public');
        result = JSON.parse(result);
        if (result.rows) {
          res.json(result.rows);
          return;
        }
      }
      requestStreams(req.query.providers, req.query.titletype, req.query.sort, req.query.start, req.query.limit, req.query.genre, function (err, data) {
        if (err) {
          res.status(404);
          res.json({ error: 'error' });
          res.end();
        } else {
          if (data && data.rows[0] && data.rows[0].title_name) {
            var cacheData = {
              rows: data.rows
            };
            cacheData = JSON.stringify(cacheData);
            redisClient.setex(cacheKey, config.REDIS_CACHE_TIME, cacheData);
            res.header('Cache-Control', `max-age=${config.BROWSER_CACHE_TIME}, public`);
            res.json(data.rows);
          } else {
            res.status(404);
            res.json({ error: 'error' });
            res.end();
          }
        }
      });
    });
  });

};
