var request = require('request');
var providerConfig = require('../config/environment/index.js');
var Config = require('../config/environment/config.js');
var config = new Config();
var CompletenessCheck = function(client) {
  this.totalGuideboxCount = 0;
  this.totalDbInserts = 0;
  this.client = client;
  Date.prototype.yyyymmdd = function yyyymmdd() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
          ].join('-');
  };
  var dateToday = new Date();
  dateToday.setHours(0,0,0,0);
  this.dateToday = dateToday.yyyymmdd();
  this.getTotalGuideboxCount = function(override) {
    return new Promise((resolve, reject) => {
      if (override) {
        resolve(override);
        return;
      }
      var guideboxRequestCount = 0;

      function handleGuideboxCount(self) {
        guideboxRequestCount++;
        if (guideboxRequestCount === providerConfig.PROVIDERS.length) {
          resolve(self.totalGuideboxCount);
        }
      }
      for (var i = 0; i < providerConfig.PROVIDERS.length; i++) {
        var url = `http://api-public.guidebox.com/v2/${providerConfig.PROVIDERS[i].type}?api_key=${config.GUIDEBOX_API_KEY}&sources=${providerConfig.PROVIDERS[i].imdbName}&limit=25`;
        request(url, function (error, response, body) {
          if (!error) {
            body = JSON.parse(body);
            if (body.total_results) {
              this.totalGuideboxCount += body.total_results;
            }
          } else {
            reject(error);
          }
          handleGuideboxCount(this);
        }.bind(this));
      }
    });
  }.bind(this);

  this.init = function() {
    return new Promise((resolve, reject) => {
      if (this.totalGuideboxCount > 0) {
        this.getTotalGuideboxCount(this.totalGuideboxCount).then(function(result) {
          console.log(result);
          this.getDbConnections().then(result => {
            // if at least 90% of provider_titles got inserted, I'm calling it a success and deleting old ones
            if ((this.totalGuideboxCount * (0.9)) < parseInt(result)) {
              this.removeOldConnections().then(response => {
                resolve(response);
              });
            } else {
              reject({err: 'totalDbInserts not above 90%'});
            }
          }).catch(err => {
            reject(err);
          });
        }.bind(this)).catch(err => {
          console.log(err);
          reject(err);
        });
      }
    });
  };

  this.getDbConnections = function() {
    return new Promise((resolve, reject) => {
      this.client.query(`SELECT title_id FROM provider_title WHERE date_updated='${this.dateToday}'`, function(err, result) {
        if (err) {
          reject({queryError: err});
        } else {
          this.totalDbInserts = result.rows.length;
          resolve(this.totalDbInserts);
        }
      }.bind(this));
    });
  };

  this.removeOldConnections = function() {
    return new Promise((resolve, reject) => {
      this.client.query(`DELETE FROM provider_title WHERE date_updated <> '${this.dateToday}'`, (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log(result);
          resolve('successfully purged old data');
        }
      });
    });
  };

};

module.exports = CompletenessCheck;
