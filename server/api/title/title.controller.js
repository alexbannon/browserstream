'use strict';

var Config = require('../../config/environment/config.js');
var config = new Config();
var pg = require('pg');
var util = require('util');
var redis = require('redis');
var redisClient = redis.createClient();

function requestTitleInfo(title_id, callback) {
  if (isNaN(title_id)) { return; }
  var query = `SELECT title.title_name, title.year, title.genre, title.director, title.actors, title.plot, title.rated, title.released, title.runtime, title.writer, title.language, title.country, title.awards, title.metascore, title.imdb_votes from title WHERE title_id='${title_id}'`;
  pg.connect(config.POSTGRES_CONNECT, function(err, client, done) {
    if (err) {
      return console.error('could not connect to postgres db: ', err);
    }
    client.query(query, function(err, result) {
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

exports.index = function (req, res) {
  req.checkParams('id', 'Invalid Title ID').isInt();
  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
      return;
    }
    var cacheKey = 'cachekey-redis-';
    cacheKey += req.params.id;
    redisClient.get(cacheKey, function(err, result) {
      if (result) {
        res.header('Cache-Control', 'max-age=3600, public');
        result = JSON.parse(result);
        if (result.rows) {
          res.json(result.rows);
          return;
        }
      }
      requestTitleInfo(req.params.id, function (err, data) {
        if (err) {
          res.json({ error: 'error' });
        }
        if (data && data.rows[0] && data.rows[0].title_name) {
          var cacheData = {
            rows: data.rows
          };
          cacheData = JSON.stringify(cacheData);
          redisClient.setex(cacheKey, config.REDIS_CACHE_TIME, cacheData);
          res.header('Cache-Control', 'max-age=3600, public');
          res.json(data.rows);
        } else {
          res.status(404);
          res.json({ error: 'error' });
        }
      });
    });
  });

};
