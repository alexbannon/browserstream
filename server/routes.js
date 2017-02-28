module.exports = function(app) {
  app.use('/api/query', require('./api/query'));
  app.use('/api/title', require('./api/title'));
  app.use('/api/search', require('./api/search'));

  app.get('/', function(req, res) {
    res.sendFile('./public/index.html');
  });
  app.get('/modal/:id', function(req, res) {
    res.sendFile('./public/index.html');
  });

  app.get('*', function(req, res) {
    res.status(404);
    res.sendFile('./server/views/404.html');
  });

};
