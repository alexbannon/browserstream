var request = require('request');
var pg = require('pg');
var config = require('../config/environment/local');

var HBO = function(limit) {
  var self = this;
  this.limit = limit;
  this.finalImdbData = [];
  self.count = 0;
  self.total;

  function insertDataIntoDB(data, callback) {
    var queryString = 'INSERT INTO title (imdb_id, title_name, year, genre, director, actors, plot, image_url, imdb_rating) values ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING title_id';
    var queryValues = [data.imdbID, data.Title, data.Year, data.Genre, data.Director, data.Actors, data.Plot, data.Poster, data.imdbRating];
    // TODO handle ability to still add movies to provider_title even if title is already in db (ie multiple providers host movie);
    pg.connect(config.POSTGRES_CONNECT, function(err, client, done) {
      if (err) {
        done();
        console.error('could not connect to postgres db: ', err);
        callback(err);
        pg.end();
        return;
      }
      client.query(queryString, queryValues, function(err, result) {
        done();
        if (err) {
          done();
          console.log(err);
          callback(err);
          pg.end();
          return;
        }
        var whichTitleId = parseInt(result.rows[0].title_id);

        // TODO - make pg call outside each seed.js file to check the IDs of all providers in db and then pass it when instantiating seed object
        client.query("SELECT provider_id from provider where name = 'hbo_go'", function(err, secondRes) {
          if (err) {
            done();
            console.log(err);
            callback(err);
            pg.end();
            return;
          }
          var whichProviderId = secondRes.rows[0].provider_id;
          client.query("INSERT INTO provider_title (title_id, provider_id) values ($1, $2)", [whichTitleId, whichProviderId], function (err, result) {
            done();
            if (err) {
              done();
              console.log(err);
              callback(err);
              pg.end();
              return;
            }
            console.log(result);
            callback(err, result);
            pg.end();
          })
        })
      })
    })
  }


  function requestImdbData(imdbId, title) {
    var url = 'http://www.omdbapi.com?';
    return new Promise((resolve, reject) => {
      if (imdbId) {
        url += 'i=' + imdbId;
      } else if (title) {
        url += 't=' + title;
      } else {
        reject();
      }

      request(url, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          body = JSON.parse(body);
          insertDataIntoDB(body, (err, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(err);
            }
          })
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
    var url = 'http://api-public.guidebox.com/v2/movies?api_key=' + config.GUIDEBOX_API_KEY + '&sources=hbo&limit=' + self.limit;
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


  this.addHboToDatabase = function() {
    console.log('addHboToDatabase called');
    requestGuidebox().then(result => {
      console.log('ALL DONE');
    }).catch(err => {
      console.log('ERROR');
      console.log(err);
    })
  }
}

module.exports = HBO;
