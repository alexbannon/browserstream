var Seed = require('./seedConstructor.js');
var Pool = require('pg-pool');
var providerConfig = require('../config/environment/index.js');
var Config = require('../config/environment/config.js');
var config = new Config();
var CompletenessCheck = require('./completenessCheck.js');

var pool = new Pool(config.PG_POOL_CONFIG);
var processed = 0;
var errorCount = 0;
// this changes the offset amount of the entire process - calls will be made in batches of # given
var imdbOffset = 6;

var completenessCheck;
var totalInsertsToMake = 0;

function addProviderInfo(client, provider_id, imdbProviderName, offset, titleType) {
  return new Promise((resolve, reject) => {
    var provider = new Seed(imdbOffset, client, provider_id, imdbProviderName, offset, titleType);
    provider.addProviderTitlesToDatabase().then(result => {
      processed += parseInt(result);
      console.log('%s results processed out of %s', processed, totalInsertsToMake);
      resolve(result);
    }).catch(err => {
      reject(err);
    });
  });
}
function queryOrSkip(client, queryValue, skipValue) {
  return new Promise((resolve, reject) => {
    if (skipValue) {
      resolve(skipValue);
    } else {
      client.query(queryValue, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.rows[0].provider_id);
        }
      });

    }
  });
}
function addProviders(client, done, index, offset, provider_id) {
  if (index === (providerConfig.PROVIDERS.length)) {
    console.log('ALL DONE WITH INSERTS, CHECKING IF SAFE TO DELETE...');
    completenessCheck.init().then(response => {
      console.log(response);
      console.log('DELETION COMPLETE');
    }).catch(error => {
      console.log(error);
    });
    client.release();
    pool.end();
    return;
  }
  queryOrSkip(client, `SELECT provider_id from provider where name = '${providerConfig.PROVIDERS[index].dbName}'`, provider_id).then(response => {
    var recursiveProviderId = response;
    addProviderInfo(client, recursiveProviderId, providerConfig.PROVIDERS[index].imdbName, offset, providerConfig.PROVIDERS[index].type).then(result => {
      errorCount = 0;
      if (parseInt(result) === imdbOffset) {
        // this will take about 2 hours to input all into db on first time
        setTimeout(function() {
          addProviders(client, done, index, offset + imdbOffset, recursiveProviderId);
        }, 1250);
      } else {
        addProviders(client, done, (index + 1), 0);
      }
    }).catch(err => {
      console.log(err);
      errorCount++;
      console.log('Consecutive Errors: ' + errorCount);
      if (errorCount >= 5) {
        done();
        client.release();
        pool.end();
        process.exit();
        console.log('THIS SHOULD BE DONEZO');
      } else {
        var timeoutMills = 10000;
        var errorOffset = offset + imdbOffset;
        if (err.error === 'guideboxError') {
          // give guidebox a full minute to catch up
          timeoutMills = 60000;
          errorOffset = offset;
        }
        // lets give guidebox a minute to have everything catch up a bit
        setTimeout(function() {
          addProviders(client, done, index, errorOffset, recursiveProviderId);
        }, timeoutMills);

      }
    });
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
  completenessCheck = new CompletenessCheck(client);

  completenessCheck.getTotalGuideboxCount().then(response => {
    console.log('starting off the seed file');
    console.log('there will be %s insertions to make', response);
    console.log('holding for 10 seconds to not overload guidebox api...');
    totalInsertsToMake = response;
    // just made 8 quick requests to guidebox, so lets hold off a bit before starting everything
    setTimeout(function() {
      addProviders(client, done, 0, 0);
    }, 10000);
  }).catch(err => {
    console.log(err);
    done();
    client.release();
    pool.end();
  });
});
