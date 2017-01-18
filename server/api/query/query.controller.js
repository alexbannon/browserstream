'use strict';
// var _ = require('lodash');
var config = require('../../config/environment/local.js');
var pg = require('pg');
var util = require('util');

function requestStreams(providers, sort, callback) {
  var query = "SELECT * FROM provider_title JOIN provider ON provider_title.provider_id = provider.provider_id JOIN title ON title.title_id = provider_title.title_id where provider.name = '";
  for (var i = 0; i < providers.length; i++) {
    query += providers[i].name + "'"
    if (i === providers.length - 1) {
      break;
    }
    query += " OR provider.name = '";
  }
  query += ' ORDER BY imdb_rating DESC LIMIT 15';
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
    })
  })
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
}

exports.index = function (req, res) {
  req.checkBody(validatorSchema);
  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
      return;
    }
    requestStreams(req.body.providers, req.body.sort, function (err, data) {
      if (err) {
        res.json({ error: 'error' });
      }
      if (data && data.rows[0] && data.rows[0].title_name) {
        res.header('Cache-Control', 'max-age=900, public');
        res.json(data.rows);
      }
    });
  });

};
