var request = require('request');
var pg = require('pg');
var config = require('../config/environment/local');

var Seed = function(limit, poolClient, providerId, providerName) {
  this.limit = limit;
  this.client = poolClient;
  this.providerId = providerId;
  this.titleId;
  this.providerName = providerName;
  this.finalImdbData = [];
  this.count = 0;
  this.total;
  this.skip = false;
  var self = this;

  function query(query, queryValuesArray, skip) {
    return new Promise((resolve, reject) => {
      if (skip) {
        var skippedResult = {
          rows: [{title_id: self.titleId}]
        }
        self.skip = false;
        resolve(skippedResult);
        return;
      }
      self.client.query(query, queryValuesArray, function(err, result) {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(result);
      })
    })
  }

  function insertDataIntoDB(data, callback) {
    var queryString = 'INSERT INTO title (imdb_id, title_name, year, genre, director, actors, plot, image_url, imdb_rating) values ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING title_id';
    var queryValues = [data.imdbID, data.Title, data.Year, data.Genre, data.Director, data.Actors, data.Plot, data.Poster, data.imdbRating];
    console.log('select title_id from title where imdb=' + data.imdbID);
    query(`SELECT title_id FROM title WHERE imdb_id='${data.imdbID}'`, []).then(function(result) {
      if (result.rows) {
        if (result.rows.length > 0) {
          self.skip = true;
          self.titleId = result.rows[0].title_id
        }
      }
      query(queryString, queryValues, self.skip).then(function(result) {
        console.log(result);
        console.log(result.rows);
        var whichTitleId = parseInt(result.rows[0].title_id);

        query("INSERT INTO provider_title (title_id, provider_id) values ($1, $2)", [whichTitleId, self.providerId]).then(function(result) {
          /*
          TODO: Figure out how to remove connections in provider_titles on each rev
          maybe add a date column and go through and remove all previous ones on success?
          ISSUE: when the connection is already there between the provider and title the date won’t get updated
          so make sure it does if you go this route. Maybe change primary key to be title_id, provider_id, and date?
          Or just make a patch statement in the final catch?
          */
          callback(err, result);
        }).catch(function(error) {
          callback(error);
        })
      }).catch(function(error) {
        callback(error);
      })
    }).catch(function(error) {
      callback(error);
    })
  }


  function requestImdbData(imdbId, title) {
    var url = 'http://www.omdbapi.com?';
    return new Promise((resolve, reject) => {
      if (imdbId) {
        // TODO check my db first - no need to hit free API so hard over time - a lot of titles will be in there the more this is used
        url += 'i=' + imdbId;
      } else if (title) {
        url += 't=' + title;
      } else {
        reject();
      }

      request(url, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          body = JSON.parse(body);
          if (body.imdbID) {
            console.log('inserting into db with returned imdb info for imdbid: ' + body.imdbID);
            insertDataIntoDB(body, (err, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(err);
              }
            })
          } else {
            console.log('no imdbId');
            reject(error);
          }
        } else {
          reject(error);
        }
      })
    });
  }

  function handleGuideboxData(data) {
    console.log('handleGuideboxData');
    self.total = data.length;

    return new Promise((resolve, reject) => {
      function handleCount() {
        self.count++;
        if (self.count === self.total) {
          resolve(self.finalImdbData);
        }
      }

      for (var i = 0; i < self.total; i++) {
        console.log('looping through data...');
        if (data[i].imdb) {
          requestImdbData(data[i].imdb).then(response => {
            handleCount();
          }).catch(err => {
            handleCount();
          })
        } else if (data[i].title) {
          requestImdbData(data[i].title).then(response => {
            handleCount();
          }).catch(err => {
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
    console.log(url);
    return new Promise((resolve, reject) => {
      request(url, function (error, response, body) {
        console.log('request made to guidebox');
        if (!error && response.statusCode === 200) {
          console.log('no error, continue');
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
