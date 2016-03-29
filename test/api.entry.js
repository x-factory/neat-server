require('dotenv').config();
var supertest = require('supertest');
var should = require('should');
var jwt = require('jsonwebtoken');
var server = supertest.agent('http://localhost:3000');
var jwtSecret = process.env.JWT_SECRET;

describe('POST /api/authenticate', function() {
  this.slow(250);

  var token;

  it('should indicate email does not exist if no matching email', function(done) {
    server
      .post('/api/authenticate')
      .send({ email: 'wrong@email.com' })
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function(err, res) {
        res.status.should.equal(400);
        res.body.message.should.equal('Email does not exist');
        done();
      });
  });

  it('should return MismatchError if password invalid', function(done) {
    server
      .post('/api/authenticate')
      .send({ email: 'test@neat.com', password: 'wrongpass' })
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function(err, res) {
        res.status.should.equal(400);
        res.body.details.name.should.equal('MismatchError');
        done();
      });
  });

  it('should respond with a token if credentials are valid', function(done) {
    server
      .post('/api/authenticate')
      .send({ email: 'test@neat.com', password: 'iloveyou' })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        res.status.should.equal(200);
        res.body.message.should.equal('Enjoy your token');
        res.body.token.should.be.String();
        token = res.body.token;
        done();
      });
  });

  it('should be a valid token', function(done) {
    jwt.verify(token, jwtSecret, function(err, decoded) {
      if (err) {
        throw err;
      } 
      decoded.ownid.should.equal(1);
      decoded.admin.should.equal(true);
      done();
    });
  });
});
