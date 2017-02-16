var Seed = require('./seedConstructor.js');
var Pool = require('pg-pool');
var config = require('../config/environment/local');

var pool = new Pool(config.PG_POOL_CONFIG);

function addProviderInfo(client, dbProviderName, imdbProviderName, offset, titleType) {
  return new Promise((resolve, reject) => {
    client.query(`SELECT provider_id from provider where name = '${dbProviderName}'`, (err, res) => {
      if (err) {
        reject(err);
      }
      var provider_id = res.rows[0].provider_id;
      var provider = new Seed(4, client, provider_id, imdbProviderName, offset, titleType);
      provider.addProviderTitlesToDatabase().then(result => {
        resolve(result);
      }).catch(err => {
        reject(err);
      });
    });
  });
}

function addProviders(client, done, index, offset) {
  if (index === (config.PROVIDERS.length)) {
    console.log('ALL DONE');
    client.release();
    pool.end();
    return;
  }
  addProviderInfo(client, config.PROVIDERS[index].dbName, config.PROVIDERS[index].imdbName, offset, config.PROVIDERS[index].type).then(result => {
    if (parseInt(result) === 4) {
      // this will take about 2 hours to input all into db on first time
      setTimeout(function() {
        addProviders(client, done, index, offset + 4);
      }, 1000);
    } else {
      addProviders(client, done, (index + 1), 0);
    }
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
  addProviders(client, done, 0, 1064);
});
