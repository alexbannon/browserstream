var request = require('request');
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
          reject({queryError: err});
        }
        resolve(result);
      });
    });
  }

  function parseIntOrReturnNegative(int) {
    var intToReturn = parseInt(int);
    return isNaN(intToReturn) ? -1 : intToReturn;
  }

  function ParseFloatOrReturnNegative(float) {
    var floatToReturn = parseFloat(float);
    return isNaN(floatToReturn) ? -1 : floatToReturn;
  }

  function insertDataIntoDB(data, titleInDB, callback) {
    var returnValue;
    var queryString, queryValues;
    if (titleInDB) {
      returnValue = data;
    } else {
      queryString = 'INSERT INTO title (imdb_id, title_name, year, genre, director, actors, plot, image_url, imdb_rating, rated, released, runtime, writer, language, country, awards, metascore, type, imdb_votes) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING title_id';
      queryValues = [data.imdbID, data.Title, parseIntOrReturnNegative(data.Year), data.Genre, data.Director, data.Actors, data.Plot, data.Poster, data.imdbRating, data.Rated, new Date(data.Released), parseIntOrReturnNegative(data.Runtime.split(' ')[0]), data.Writer, data.Language, data.Country, data.Awards, ParseFloatOrReturnNegative(data.Metascore), data.Type, parseIntOrReturnNegative(data.imdbVotes)];
      for (var i = 0; i < queryValues.length; i++) {
        queryValues[i];
      }
    }
    query(queryString, queryValues, returnValue).then(function(result) {
      var whichTitleId = parseInt(result.rows[0].title_id);

      query('INSERT INTO provider_title (title_id, provider_id) values ($1, $2)', [whichTitleId, self.providerId]).then(function(result) {
        /*
        TODO: Figure out how to remove connections in provider_titles on each rev
        maybe add a date column and go through and remove all previous ones on success?
        ISSUE: when the connection is already there between the provider and title the date won’t get updated
        so make sure it does if you go this route. Maybe change primary key to be title_id, provider_id, and date?
        Or just make a patch statement in the final catch?
        */
        callback(false, result);
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
            reject({noTitleInDb: imdbId});
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
        });
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
              });
            } else {
              reject('no imdbId');
            }
          } else {
            console.log('ERROR WITH OMDBAPI');
            console.log(error);
            console.log(response.statusCode);
            reject(error);
          }
        });
      });
    });
  }

  function handleGuideboxData(data) {
    var total = data.length;

    return new Promise((resolve, reject) => {

      var requestTimeout = setTimeout(function() {
        reject();
      }, 15000);

      function handleCount() {
        self.count++;
        if (self.count === total) {
          clearTimeout(requestTimeout);
          resolve('success');
        }
      }

      function handleError(err) {
        console.log(err);
        handleCount();
      }

      for (var i = 0; i < total; i++) {
        if (data[i].imdb) {
          requestImdbData(data[i].imdb).then(handleCount).catch(handleError);
        } else {
          handleCount();
        }
      }

    });
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
          });
        } else {
          reject(error);
        }
      });
    });
  }

  this.addProviderTitlesToDatabase = function() {
    return requestGuidebox();
  };
};

module.exports = Seed;
