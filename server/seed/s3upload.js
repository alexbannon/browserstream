var Upload = require('s3-uploader');
var config = require('../config/environment/config.js')();
var fs = require('fs');
var request = require('request');
var pg = require('pg');

var s3Client = new Upload(config.AWSBUCKETNAME, {
  aws: {
    path: 'images/',
    region: 'us-east-1',
    acl: 'public-read',
    accessKeyId: config.PUBLICAWSKEYID,
    secretAccessKey: config.SECRETAWSKEYID
  },
  cleanup: {
    versions: true,
    original: false
  },
  versions: [{
    maxHeight: 300,
    format: 'jpg',
    quality: 80,
    awsImageExpires: 31536000,
    awsImageMaxAge: 31536000
  }]
});

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

function downloadImageAndStoreInS3(resultToAdd, callback) {
  var path = `tempimages/${resultToAdd.id}`;
  download(resultToAdd.imageUrl, path, function(){

    s3Client.upload(path, {}, function(err, versions) {
      if (err) {
        throw err;
      } else {
        callback(resultToAdd.id, path, versions[0].url);
      }
    });
  });
}

function handleError(done, error) {
  done();
  console.log(error);
  pg.end();
}

function pgQuery(client, done, query, callback) {
  client.query(query, function(err, result) {
    if (err) {
      handleError(done, err);
    } else {
      callback(result);
    }
  });
}
function endConnection(done) {
  console.log('COMPLETE');
  done();
  pg.end();
}

function init(client, done, limit, offset) {
  var resultsToTransform = [];
  pgQuery(client, done, `SELECT * FROM title WHERE title.s3url IS NULL LIMIT ${limit} OFFSET ${offset}`, function(result){
    if (!result || !result.rows || result.rows.length === 0) {
      console.log('recursion complete');
      endConnection(done);
    }
    for (var i = 0; i < result.rows.length; i++) {
      var resultToTransform = {
        id: result.rows[i].title_id,
        imageUrl: result.rows[i].image_url
      };
      resultsToTransform.push(resultToTransform);
    }
    var finishedCounter = 0;
    for (var x = 0; x < resultsToTransform.length; x++) {
      if (!resultsToTransform[x].imageUrl) {
        if (++finishedCounter === resultsToTransform.length) {
          init(client, done, limit, (offset + limit));
        }
      } else {
        downloadImageAndStoreInS3(resultsToTransform[x], function(id, path, s3Url) {
          var query = `UPDATE title SET s3url = '${s3Url}' WHERE title_id = ${id}`;
          console.log(id, path, s3Url);
          console.log(query);
          pgQuery(client, done, query, function(result) {
            console.log('db updated');
            fs.unlink(path, function(){
              console.log('file uploaded to s3, successfully added to db, and deleted');
              if (++finishedCounter === resultsToTransform.length) {
                init(client, done, limit, (offset + limit));
              }
            });
          });
        });
      }
    }
  });
}

pg.connect(config.POSTGRES_CONNECT, function(err, client, done) {
  if (err) {
    done();
    pg.end();
    return;
  }
  init(client, done, 5, 0);
});
