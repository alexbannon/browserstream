    var express  = require('express');
    var app      = express();
    var path = require('path');
    var mongoose = require('mongoose');
    var port     = process.env.PORT || 3000;
    var database = require('./config/database');
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var root = process.env.root || path.normalize(__dirname + '/../');

    // configuration ===============================================================
    // mongoose.connect(database.url);     // connect to mongoDB database on modulus.io
    app.use(express.static(root + '/public/'));
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

    // routes ======================================================================
    require('./routes.js')(app);

    // listen (start app with node server.js) ======================================
    app.listen(port);
    console.log("App listening on port " + port);
