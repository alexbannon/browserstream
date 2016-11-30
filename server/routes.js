module.exports = function(app) {
  app.use('/api/query', require('./api/query'));

  app.get('/', function(req, res) {
    res.sendfile('./public/index.html');
  });
};
