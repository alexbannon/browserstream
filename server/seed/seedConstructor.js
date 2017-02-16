var request = require('request');
var config = require('../config/environment/local');

var Seed = function(limit, poolClient, providerId, providerName, offset, titleType) {
  this.titleType = titleType;
  this.limit = limit;
  this.client = poolClient;
  this.providerId = providerId;
  this.providerName = providerName;
  this.count = 0;
  this.offset = offset;

  var self = this;

  function query(query, queryValuesArray, returnKey, returnValue) {
    return new Promise((resolve, reject) => {
      if (returnKey && returnValue) {
        var skippedResult = {
          rows: [{[returnKey]: returnValue}]
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

  function parseIntOrReturnNull(int) {
    var intToReturn = parseInt(int);
    return isNaN(intToReturn) ? null : intToReturn;
  }

  function parseFloatOrReturnNull(float) {
    var floatToReturn = parseFloat(float);
    return isNaN(floatToReturn) ? null : floatToReturn;
  }

  function dateOrNull(date) {
    if (isNaN(date)) {
      return null;
    } else {
      return (new Date(date));
    }
  }

  function sanitizeData(data) {
    if (data === 'N/A' || data === '' || data === null) {
      return null;
    } else {
      return data;
    }
  }

  function insertDataIntoDB(data, titleInDB, callback) {
    var returnValue;
    var queryString, queryValues, sanitizedData;
    if (titleInDB) {
      returnValue = data;
    } else {
      queryString = 'INSERT INTO title (imdb_id, title_name, year, genre, director, actors, plot, image_url, imdb_rating, rated, released, runtime, writer, language, country, awards, metascore, type, imdb_votes) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING title_id';
      queryValues = [data.imdbID, data.Title, parseIntOrReturnNull(data.Year), data.Genre, data.Director, data.Actors, data.Plot, data.Poster, parseFloatOrReturnNull(data.imdbRating), data.Rated, dateOrNull(data.Released), parseIntOrReturnNull(data.Runtime.split(' ')[0]), data.Writer, data.Language, data.Country, data.Awards, parseFloatOrReturnNull(data.Metascore), data.Type, parseIntOrReturnNull(data.imdbVotes)];
      sanitizedData = queryValues.map(sanitizeData);
    }
    query(queryString, sanitizedData, 'title_id', returnValue).then(result => {
      var whichTitleId = parseInt(result.rows[0].title_id);
      query(`SELECT title_id, provider_id FROM provider_title WHERE title_id=${whichTitleId} AND provider_id=${self.providerId}`, []).then(result => {
        var dateToday = new Date();
        dateToday.setHours(0,0,0,0);
        var finalQuery = 'INSERT INTO provider_title (title_id, provider_id, date_added, date_updated) values ($1, $2, $3, $4)';
        var finalValues = [whichTitleId, self.providerId, dateToday, dateToday];
        if (result.rows.length > 0) {
          finalQuery = 'UPDATE provider_title SET date_updated=$1 WHERE title_id=$2 AND provider_id=$3';
          finalValues = [dateToday, whichTitleId, self.providerId];
        }
        query(finalQuery, finalValues).then(result => {
          callback(false, result);
        }).catch(err => callback(err));
      }).catch(err => callback(err));
    }).catch(err => callback(err));
  }

  function checkIfTitleAlreadyExists(imdbId) {
    return new Promise((resolve, reject) => {
      query(`SELECT title_id FROM title WHERE imdb_id='${imdbId}'`, []).then(result => {
        if (result.rows.length > 0) {
          resolve(result.rows[0].title_id);
        } else {
          reject('query did not return rows');
        }
      }).catch(err => reject(err));
    });
  }

  function requestImdbData(imdbId) {
    return new Promise((resolve, reject) => {
      checkIfTitleAlreadyExists(imdbId).then(result => {
        console.log('****** GOT RESULT, NO NEED FOR OMDBAPI *******');
        insertDataIntoDB(result, true, (err, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(err);
          }
        });
      }).catch(err => {
        console.log(err);
        var url = config.OMDB_API_URL;
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
        } else if (data[i].imdb_id) {
          requestImdbData(data[i].imdb_id).then(handleCount).catch(handleError);
        } else {
          handleCount();
        }
      }

    });
  }

  function requestGuidebox() {
    var url = `http://api-public.guidebox.com/v2/${self.titleType}?api_key=${config.GUIDEBOX_API_KEY}&sources=${self.providerName}&limit=${self.limit}&offset=${self.offset}`;
    return new Promise((resolve, reject) => {
      request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          body = JSON.parse(body);
          handleGuideboxData(body.results).then(result => {
            resolve(body.total_returned);
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
