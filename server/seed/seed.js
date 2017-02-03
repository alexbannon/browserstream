var Seed = require('./seedConstructor.js');
var Pool = require('pg-pool');
var config = require('../config/environment/local');

var pool = new Pool(config.PG_POOL_CONFIG);

function addProviderInfo(client, dbProviderName, imdbProviderName) {
  client.query("SELECT provider_id from provider where name = '"+dbProviderName+"'", (err, res) => {
    if (err) {
      console.log(err);
      done();
      client.release()
      pool.end()
      return;
    }
    var provider_id = res.rows[0].provider_id;
    var provider = new Seed(100, client, provider_id, imdbProviderName);
    provider.addProviderTitlesToDatabase().then(result => {
      client.release();
      pool.end();
      console.log('ALL DONE');
    }).catch(err => {
      client.release();
      pool.end();
      console.log('ERROR');
      console.log(err);
    });

  });

}

pool.connect((err, client, done) => {
  if (err) {
    console.log(err);
    return done(err);
  }
  // addProviderInfo(client, 'hbo_go', 'hbo');
  // addProviderInfo(client, 'netflix', 'netflix');
  // addProviderInfo(client, 'amazon_prime', 'amazon_prime');
  addProviderInfo(client, 'hulu', 'hulu_plus');

});
