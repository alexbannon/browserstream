
'use strict';
// var _ = require('lodash');
var config = require('../../config/environment/local.js');
var pg = require('pg');

var requestStream = function(providers, callback) {
  var query = "SELECT * FROM provider_title JOIN provider ON provider_title.provider_id = provider.provider_id JOIN title ON title.title_id = provider_title.title_id where provider.name = '";
  for (var i = 0; i < providers.length; i++) {
    query += providers[i] + "'"
    if (i === providers.length - 1) {
      break;
    }
    query += " OR provider.name = '";
  }
  query += ' ORDER BY imdb_rating DESC';
  pg.connect(config.POSTGRES_CONNECT, function(err, client, done) {
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

exports.index = function (req, res) {
  var providers = req.query.provider || 'netflix';
  providers = providers.split(',');


  requestStream(providers, function (err, data) {
    if (err) {
      res.json({ error: 'error' });
    }
    if (data && data.rows[0] && data.rows[0].title_name) {
      res.header('Cache-Control', 'max-age=900, public');
      res.json(data.rows);
    }
  });
};
