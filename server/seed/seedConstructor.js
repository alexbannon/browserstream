var request = require('request');
var pg = require('pg');
var config = require('../config/environment/local');

var Seed = function(limit, poolClient, providerId, providerName) {
  this.limit = limit;
  this.client = poolClient;
  this.providerId = providerId;
  this.providerName = providerName;
  this.count = 0;
  var self = this;

  function query(query, queryValuesArray, returnValue) {
    return new Promise((resolve, reject) => {
      if (returnValue) {
        var skippedResult = {
          rows: [{title_id: returnValue}]
        };
        resolve(skippedResult);
        return;
      }
      self.client.query(query, queryValuesArray, function(err, result) {
        if (err) {
          reject(err);
        }
        resolve(result);
      })
    })
  }

  function insertDataIntoDB(data, titleInDB, callback) {
    var returnValue;
    var queryString, queryValues;
    if (titleInDB) {
      returnValue = data;
    } else {
      queryString = 'INSERT INTO title (imdb_id, title_name, year, genre, director, actors, plot, image_url, imdb_rating) values ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING title_id';
      queryValues = [data.imdbID, data.Title, data.Year, data.Genre, data.Director, data.Actors, data.Plot, data.Poster, data.imdbRating];
    }
    query(queryString, queryValues, returnValue).then(function(result) {
      var whichTitleId = parseInt(result.rows[0].title_id);

      query("INSERT INTO provider_title (title_id, provider_id) values ($1, $2)", [whichTitleId, self.providerId]).then(function(result) {
        /*
        TODO: Figure out how to remove connections in provider_titles on each rev
        maybe add a date column and go through and remove all previous ones on success?
        ISSUE: when the connection is already there between the provider and title the date won’t get updated
        so make sure it does if you go this route. Maybe change primary key to be title_id, provider_id, and date?
        Or just make a patch statement in the final catch?
        */
        callback(null, result);
      }).catch(err => callback(err));
    }).catch(err => callback(err));
  }

  function checkIfTitleAlreadyExists(imdbId) {
    return new Promise((resolve, reject) => {
      query(`SELECT title_id FROM title WHERE imdb_id='${imdbId}'`, []).then(result => {
        if (result.rows) {
          if (result.rows.length > 0) {
            resolve(result.rows[0].title_id);
          } else {
            reject('no title in db');
          }
        } else {
          reject('query did not return rows');
        }
      }).catch(err => reject(err));
    });

  }

  function requestImdbData(imdbId) {
    return new Promise((resolve, reject) => {
      checkIfTitleAlreadyExists(imdbId).then(result => {
        insertDataIntoDB(result, true, (err, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(err);
          }
        })
      }).catch(err => {
        console.log(err);
        var url = 'http://www.omdbapi.com?';
        url += 'i=' + imdbId;
        request(url, function(error, response, body) {
          if (!error && response.statusCode === 200) {
            body = JSON.parse(body);
            if (body.imdbID) {
              insertDataIntoDB(body, false, (err, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(err);
                }
              })
            } else {
              reject('no imdbId');
            }
          } else {
            reject(error);
          }
        })
      })
    });
  }

  function handleGuideboxData(data) {
    var total = data.length;

    return new Promise((resolve, reject) => {
      function handleCount() {
        self.count++;
        if (self.count === total) {
          resolve('success');
        }
      }

      for (var i = 0; i < total; i++) {
        if (data[i].imdb) {
          requestImdbData(data[i].imdb).then(response => {
            handleCount();
          }).catch(err => {
            console.log(err);
            handleCount();
          })
        } else {
          handleCount();
        }
      }
    })
  }

  function requestGuidebox() {
    var url = 'http://api-public.guidebox.com/v2/movies?api_key=' + config.GUIDEBOX_API_KEY + `&sources=${self.providerName}&limit=` + self.limit;
    return new Promise((resolve, reject) => {
      request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          body = JSON.parse(body);
          handleGuideboxData(body.results).then(result => {
            resolve(result);
          }).catch(err => {
            reject(err);
          })
        } else {
          reject(error);
        }
      })
    })
  }

  this.addProviderTitlesToDatabase = function() {
    return requestGuidebox();
  }
}

module.exports = Seed;
