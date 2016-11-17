var request = require('request');
var cheerio = require('cheerio');
var pg = require('pg');
var http = require('http');

// next steps, move scraped netflix data to db
// use https://api.guidebox.com/apidocs to expand db dramatically
// start front end work

function handleImdbResponse(response) {
  console.log('***');
  console.log(response);
}

function handleImdbError(error) {
  console.log('###');
  console.log(error);
}

request('http://www.newsday.com/entertainment/movies/best-netflix-movies-to-watch-now-1.6667007', function (error, response, html) {
  if (!error && response.statusCode === 200) {
    var $ = cheerio.load(html);
    $('#content').children().each(function(i, element) {
      var section = $(this);
      var title = section.children('h2').eq(0).text();
      if (title) {
        title = title.replace(new RegExp('"', 'g'), '');
        var imdbSearch = encodeURI(title);
        var url = 'http://www.omdbapi.com?t=' + imdbSearch;
        request(url, function(error, response, body) {
          if (error) {
            handleImdbError(error);
            return;
          }
          body = JSON.parse(body);
          handleImdbResponse(body)
        })
      }
    })
  }
})
