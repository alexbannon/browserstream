var should = require('chai').should(),
expect = require('chai').expect,
supertest = require('supertest'),
api = supertest('http://localhost:3000');

describe('Provider', function() {
  it('should return a 400 response when data is missing', function(done){
    api.get('/api/query?sort=top&start=0')
    .set('Accept', 'application/json')
    .expect(400,done);
  });
  it('should return a 400 response when bad data is passed', function(done){
    api.get('/api/query?sort=top&start=0&providers=;dropTable%20providers')
    .set('Accept', 'application/json')
    .expect(400,done);
  });
  it('should return an object with titles and data', function(done){
    api.get('/api/query?sort=top&start=0&providers=netflix&providers=hbo_go&providers=amazon_prime&providers=hulu')
    .set('Accept', 'application/json')
    .expect(200)
    .end(function(err, res) {
      expect(res.body).to.not.be.empty;
      expect(res.body[0]).to.have.property("title_id");
      expect(res.body[0]).to.have.property("name");
      expect(res.body[0]).to.have.property("imdb_id");
      expect(res.body[0]).to.have.property("title_name");
      expect(res.body[0]).to.have.property("year");
      expect(res.body[0]).to.have.property("genre");
      expect(res.body[0]).to.have.property("director");
      expect(res.body[0]).to.have.property("actors");
      expect(res.body[0]).to.have.property("plot");
      expect(res.body[0]).to.have.property("image_url");
      expect(res.body[0]).to.have.property("imdb_rating");
      expect(res.body).to.be.an('array');
      done();
    });
  });


})
