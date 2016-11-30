
'use strict';
// var _ = require('lodash');
var config = require('../../config/environment/local.js');
var pg = require('pg');

var requestStream = function(provider, callback) {
  var query = "SELECT * FROM provider_title JOIN provider ON provider_title.provider_id = provider.provider_id JOIN title ON title.title_id = provider_title.title_id where provider.name = '"+provider+"'";
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
  var provider = req.params.provider === undefined ? 'netflix' : req.params.provider;

  requestStream(provider, function (err, data) {
    console.log(data);
    if (err) {
      res.json({ error: 'error' });
    }
    if (data && data.rows[0] && data.rows[0].title_name) {
      res.header('Cache-Control', 'max-age=900, public');
      res.json(data.rows);
    }
  });
};
