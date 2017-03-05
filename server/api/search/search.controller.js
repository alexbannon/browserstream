'use strict';

var config = require('../../config/environment/config.js')();
var pg = require('pg');
var util = require('util');
var redis = require('redis');
var redisClient = redis.createClient();

function searchTitle(searchQuery, callback) {
  var query = 'SELECT * from title WHERE to_tsvector(\'simple\', title_name) @@ plainto_tsquery(\'simple\', $1) ORDER BY imdb_votes DESC NULLS LAST LIMIT 10';
  searchQuery = '%' + searchQuery + '%';
  var queryValues = [searchQuery];
  pg.connect(config.POSTGRES_CONNECT, function(err, client, done) {
    if (err) {
      callback(err);
    } else {
      client.query(query, queryValues, function(err, result) {
        done();
        if (err) {
          callback(err);
        } else {
          callback(err, result);
        }
        pg.end();
      });
    }
  });
}

exports.index = function (req, res) {
  req.sanitizeParams('search');
  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
      return;
    }
    var cacheKey = 'cachekey-redis-';
    cacheKey += req.params.search;
    redisClient.get(cacheKey, function(err, result) {
      if (result) {
        res.header('Cache-Control', 'max-age=3600, public');
        result = JSON.parse(result);
        if (result.rows) {
          res.json(result.rows);
          return;
        }
      }
      searchTitle(req.params.search, function (err, data) {
        if (err) {
          res.json({ error: err });
        } else {
          var cacheData = {
            rows: data.rows
          };
          cacheData = JSON.stringify(cacheData);
          redisClient.setex(cacheKey, config.REDIS_CACHE_TIME, cacheData);
          res.header('Cache-Control', 'max-age=3600, public');
          res.json(data.rows);
        }
      });
    });
  });

};
