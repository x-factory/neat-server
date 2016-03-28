var supertest = require('supertest');
var should = require('should');
var server = supertest.agent('http://localhost:3000');

describe('User APIs', function() {
  this.slow(250);
  var token;

  before(function(done) {
    server
      .post('/api/authenticate')
      .send({ email: 'test@neat.com', password: 'iloveyou' })
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        token = 'Bearer ' + res.body.token;
        done();
      });
  });

  describe('GET /users', function() {
    it('should return an array of users', function(done) {
      server
        .get('/api/users')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.users.should.be.Array();
          done();
        });
    });
  });

});
