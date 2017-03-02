var path = require('path');

module.exports = function(app) {
  app.use('/api/query', require('./api/query'));
  app.use('/api/title', require('./api/title'));
  app.use('/api/search', require('./api/search'));

  app.get('/', function(req, res) {
    res.sendFile(path.resolve(__dirname + '/../public/index.html'));
  });
  app.get('/search/:searchTerm', function(req, res) {
    res.sendFile(path.resolve(__dirname + '/../public/index.html'));
  });

  app.get('/modal/:id', function(req, res) {
    res.sendFile(path.resolve(__dirname + '/../public/index.html'));
  });

  app.get('/*', function(req, res) {
    res.status(404);
    res.sendFile(__dirname + '/views/404.html');
  });

};
