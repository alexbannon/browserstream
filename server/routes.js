module.exports = function(app) {
  app.use('/api/query', require('./api/query'));

  app.get('/', function(req, res) {
    res.sendfile('./public/index.html');
  });
  app.get('/modal/:id', function(req, res) {
    res.sendfile('./public/index.html');
  });

};
