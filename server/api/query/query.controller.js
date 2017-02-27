'use strict';
// var _ = require('lodash');
var Config = require('../../config/environment/config.js');
var config = new Config();
var pg = require('pg');
var util = require('util');
var redis = require('redis');
var redisClient = redis.createClient();


function requestStreams(providers, titleType, sort, offset, limit, callback) {
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

  var query = `SELECT t.title_id, t.title_name, t.imdb_id, t.image_url, t.imdb_rating, array_agg( p.provider_id ) as providers_ids, array_agg( p.name ) as providers_names FROM provider_title as pt JOIN provider as p ON pt.provider_id = p.provider_id JOIN title as t ON t.title_id = pt.title_id WHERE p.name IN ${providerParams} AND t.type IN ${titleTypeParams} GROUP BY t.title_id, t.title_name ORDER BY ${sortQuery} LIMIT ${limit} OFFSET ${offset};`;
  pg.connect(config.POSTGRES_CONNECT, function(err, client, done) {
    if (err) {
      return console.error('could not connect to postgres db: ', err);
    }
    client.query(query, queryValues, function(err, result) {
      done();
      if (err) {
        callback(err);
      }
      if (callback) {
        callback(err, result);
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
  }
};

exports.index = function (req, res) {
  if (typeof req.query.providers === 'string') {
    req.query.providers = [req.query.providers];
  }
  if (typeof req.query.titletype === 'string') {
    req.query.titletype = [req.query.titletype];
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
    for (var i = 0; i < req.query.providers.length; i++) {
      cacheKey += req.query.providers[i];
    }
    for (var x = 0; x < req.query.titletype.length; x++) {
      cacheKey += req.query.titletype[x];
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
      requestStreams(req.query.providers, req.query.titletype, req.query.sort, req.query.start, req.query.limit, function (err, data) {
        if (err) {
          res.json({ error: 'error' });
        }
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
        }
      });
    });
  });

};
