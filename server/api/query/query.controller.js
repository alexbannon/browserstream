'use strict';
// var _ = require('lodash');
var config = require('../../config/environment/local.js');
var pg = require('pg');
var util = require('util');
var redis = require('redis');
var redisClient = redis.createClient();


function requestStreams(providers, sort, offset, callback) {
  offset = (isNaN(parseInt(offset))) ? 0 : offset;
  var queryValues = [];
  var parametersArray = [];
  var allowedProviders = ['netflix', 'hbo_go', 'amazon_prime', 'hulu'];
  providers.forEach((element, index) => {
    if (allowedProviders.indexOf(element) === -1) {return;}
    parametersArray.push(('$' + (index+1)));
    queryValues.push(element);
  });
  var parameters = parametersArray.join(', ');
  parameters = '(' + parameters + ')';
  var query = `SELECT * FROM provider_title JOIN provider ON provider_title.provider_id = provider.provider_id JOIN title ON title.title_id = provider_title.title_id WHERE provider.name IN ${parameters} ORDER BY imdb_rating DESC OFFSET ${offset}`;
  console.log(query, queryValues);
  pg.connect(config.POSTGRES_CONNECT, function(err, client, done) {
    if (err) {
      return console.error('could not connect to postgres db: ', err);
    }
    client.query(query, queryValues, function(err, result) {
      done();
      if (err) {
        console.log(err);
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
      options: ['^(top|comedy|action)', 'i']
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
  }
};

exports.index = function (req, res) {
  if (typeof req.query.providers === 'string') {
    req.query.providers = [req.query.providers];
  }
  req.checkQuery(validatorSchema);
  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
      return;
    }
    var cacheKey = 'z-redis-';
    for (var i = 0; i < req.query.providers.length; i++) {
      cacheKey += req.query.providers[i];
    }
    cacheKey += req.query.sort;
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
      requestStreams(req.query.providers, req.query.sort, req.query.start, function (err, data) {
        if (err) {
          res.json({ error: 'error' });
        }
        if (data && data.rows[0] && data.rows[0].title_name) {
          var cacheData = {
            rows: data.rows
          };
          cacheData = JSON.stringify(cacheData);
          redisClient.setex(cacheKey, 100, cacheData);
          res.header('Cache-Control', 'max-age=3600, public');
          res.json(data.rows);
        }
      });
    });
  });

};
