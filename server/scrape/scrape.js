/*
NOTE: THIS IS UNNEEDED SCRAPING CODE REPLACED BY THE SEEDCONSTRUCTOR FILE
KEEP IN CASE API REPLACEMENT NEEDED AND RETURN TO SCRAPING FOR NETFLIX IS NECESSARY
*/

/*
var request = require('request');
var cheerio = require('cheerio');
var pg = require('pg');
var http = require('http');
var config = require('../config/environment/config.js')();

var imdbResponse = [];
var requestCount = 0;
var final = false;
var dbCount = 0;
var keys = ['imdbID', 'Title', 'Year', 'Genre', 'Director', 'Actors', 'Plot', 'Poster', 'imdbRating'];
var queryString = 'INSERT INTO title (imdb_id, title_name, year, genre, director, actors, plot, image_url, imdb_rating) values ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING title_id';
var conString = config.POSTGRES_CONNECT;

function dbSuccess(err, result) {
  var whichTitleId = parseInt(result.rows[0].title_id);
  pg.connect(conString, function (err, client, done) {
    client.query("SELECT provider_id from provider where name = 'netflix'", function(err, secondRes) {
      var whichProviderId = secondRes.rows[0].provider_id;
      client.query("INSERT INTO provider_title (title_id, provider_id) values ($1, $2)", [whichTitleId, whichProviderId], function (err, result) {
        done();
        if (err) {
          console.log(err);
        }
      })
    })

  })
  // process.exit()
}

function handleImdbResponse(response, finalResponse) {
  imdbResponse.push(response);
  if (finalResponse) {
    parseResponsesForDb(dbSuccess);
  }
}

function handleImdbError(error, finalResponse) {
  console.log(error);
  if (finalResponse && imdbResponse.length > 0) {
    parseResponsesForDb(dbSuccess)
  }
}

function insertRowIntoDb(row, callback, parseCount) {
  pg.connect(conString, function (err, client, done) {
    client.query(queryString, row, function (err, result) {
      done();
      if (err) {
        console.log(err);
      }
      if (callback) {
        callback(err, result);
      }
    })
  })

}
function createValueArray(valuesObject) {
  var valuesArray = [];
  for (var i = 0; i < keys.length; i++) {
    if (!valuesObject['Title']) {
      return;
    }
    if (valuesObject[keys[i]]) {
      valuesArray.push(valuesObject[keys[i]])
    } else {
      valuesArray.push(null);
    }
  }
  return valuesArray;
}
function parseResponsesForDb(callback) {
  for (var i = 0; i < imdbResponse.length; i++) {
    var dbValues = createValueArray(imdbResponse[i]);
    if (!dbValues || dbValues.length === 0) {
      continue;
    }
    insertRowIntoDb(dbValues, callback);
  }
}

request('http://www.newsday.com/entertainment/movies/best-netflix-movies-to-watch-now-1.6667007', function (error, response, html) {
  if (!error && response.statusCode === 200) {
    var $ = cheerio.load(html);
    var titleCount = $('#content').children().length;
    $('#content').children().each(function(i, element) {
      var section = $(this);
      var title = section.children('h2').eq(0).text();
      if (title) {
        title = title.replace(new RegExp('"', 'g'), '');
        var imdbSearch = encodeURI(title);
        var url = 'http://www.omdbapi.com?t=' + imdbSearch;
        request(url, function(error, response, body) {
          requestCount++;
          if (requestCount === titleCount) {
            final = true;
          }
          if (error) {
            handleImdbError(error, final);
            return;
          }
          body = JSON.parse(body);
          handleImdbResponse(body, final)
        })
      } else {
        titleCount--;
      }
    })
  }
})
*/
