module.exports = function(app) {
  app.use('/api/query', require('./api/query'));
  app.use('/api/title', require('./api/title'));

  app.get('/', function(req, res) {
    res.sendfile('./public/index.html');
  });
  app.get('/modal/:id', function(req, res) {
    res.sendfile('./public/index.html');
  });

  app.get('*', function(req, res) {
    res.status(404);
    res.sendfile('./server/views/404.html');
  });

};
