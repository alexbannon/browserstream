var Seed = require('./seedConstructor.js');
var Pool = require('pg-pool');
var config = require('../config/environment/local');

var pool = new Pool(config.PG_POOL_CONFIG);

function addProviderInfo(client, dbProviderName, imdbProviderName) {
  return new Promise((resolve, reject) => {
    client.query(`SELECT provider_id from provider where name = '${dbProviderName}'`, (err, res) => {
      if (err) {
        reject(err);
      }
      var provider_id = res.rows[0].provider_id;
      var provider = new Seed(100, client, provider_id, imdbProviderName);
      provider.addProviderTitlesToDatabase().then(result => {
        resolve(result);
      }).catch(err => {
        reject(err);
      });
    });
  });
}

function addProviders(client, done, index) {
  if (index === (config.PROVIDERS.length)) {
    console.log('ALL DONE');
    client.release();
    pool.end();
    return;
  }
  addProviderInfo(client, config.PROVIDERS[index].dbName, config.PROVIDERS[index].imdbName).then(result => {
    console.log(result);
    addProviders(client, done, (index + 1));
  }).catch(err => {
    console.log(err);
    done();
    client.release();
    pool.end();
  });
}

pool.connect((err, client, done) => {
  if (err) {
    console.log(err);
    return done(err);
  }
  addProviders(client, done, 0);
});
