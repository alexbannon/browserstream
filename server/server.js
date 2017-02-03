    var express  = require('express');
    var app      = express();
    var path = require('path');
    var port     = process.env.PORT || 3000;
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var expressValidator = require('express-validator'); // validating the POST request in query controller
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var root = process.env.root || path.normalize(__dirname + '/../');

    var redis = require('redis');
    var redisClient = redis.createClient();

    redisClient.on('ready',function() {
     console.log("Redis is ready");
    });

    redisClient.on('error',function(err) {
     console.log("Error in Redis: " + err);
    });
    // configuration ===============================================================
    app.use(express.static(root + '/public/'));
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(expressValidator({
     customValidators: {
       isArray: function(value) {
         return Array.isArray(value);
       },
       eachIsProvider: function(values) {
         if (!values) {
           return false;
         }
         var providerArray = ['netflix', 'hbo_go', 'amazon_prime', 'hulu'];
        return values.every(function(val) {
          console.log('val: ' + val + ' and does it exist in array: ' + (providerArray.indexOf(val)));
          return (providerArray.indexOf(val) !== -1);
        });
       }
     }
    }));
    app.use(methodOverride('X-HTTP-Method-Override'));
    app.disable('x-powered-by')

    // routes ======================================================================
    require('./routes.js')(app);

    // listen (start app with node server.js) ======================================
    app.listen(port);
    console.log("App listening on port " + port);
