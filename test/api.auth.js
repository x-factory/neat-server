var supertest = require('supertest');
var should = require('should');
var server = supertest.agent('http://localhost:3000');

describe('JWT Auth route protection', function() {
  this.slow(250);
  var token = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.';
  token += 'eyJvd25pZCI6MSwiYWRtaW4iOnRydWUsImlhdCI6MTQ';
  token += '1OTE4Mjc3NSwiZXhwIjoxNDU5MTg5OTc1fQ.';
  token += 'g_c6U3u5WazXp4aaScLHwHkSqDSi6gOrTmVNTF3WL08';
  var invalidToken = token.replace(/\d/g, '0');

  describe('GET /users', function() {
    it('should return UnauthorizedError without token', function(done) {
      server
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.error.name.should.equal('UnauthorizedError');
          done();
        });
    });

    it('should return "invalid token" with invalid token', function(done) {
      server
        .get('/api/users')
        .set('Authorization', invalidToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('invalid token');
          done();
        });
    });
  });

  describe('POST /users', function() {
    it('should return UnauthorizedError without token', function(done) {
      server
        .post('/api/users')
        .send({ email: 'email.address' })
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.error.name.should.equal('UnauthorizedError');
          done();
        });
    });

    it('should return "invalid token" with invalid token', function(done) {
      server
        .post('/api/users')
        .send({ email: 'email.address' })
        .set('Authorization', invalidToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('invalid token');
          done();
        });
    });
  });

  describe('PUT /user/:user_id', function() {
    it('should return UnauthorizedError without token', function(done) {
      server
        .put('/api/user/1')
        .send({ name: 'new name' })
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.error.name.should.equal('UnauthorizedError');
          done();
        });
    });

    it('should return "invalid token" with invalid token', function(done) {
      server
        .put('/api/user/1')
        .send({ name: 'new name' })
        .set('Authorization', invalidToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('invalid token');
          done();
        });
    });
  });

  describe('DELETE /user/:user_id', function() {
    it('should return UnauthorizedError without token', function(done) {
      server
        .del('/api/user/1')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.error.name.should.equal('UnauthorizedError');
          done();
        });
    });

    it('should return "invalid token" with invalid token', function(done) {
      server
        .del('/api/user/1')
        .set('Authorization', invalidToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('invalid token');
          done();
        });
    });
  });


  describe('GET /types', function() {
    it('should return UnauthorizedError without token', function(done) {
      server
        .get('/api/types')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.error.name.should.equal('UnauthorizedError');
          done();
        });
    });

    it('should return "invalid token" with invalid token', function(done) {
      server
        .get('/api/types')
        .set('Authorization', invalidToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('invalid token');
          done();
        });
    });
  });

  describe('POST /types', function() {
    it('should return UnauthorizedError without token', function(done) {
      server
        .post('/api/types')
        .send({ name: 'new type' })
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.error.name.should.equal('UnauthorizedError');
          done();
        });
    });

    it('should return "invalid token" with invalid token', function(done) {
      server
        .post('/api/types')
        .send({ name: 'new type' })
        .set('Authorization', invalidToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('invalid token');
          done();
        });
    });
  });

  describe('DELETE /type/:type_id', function() {
    it('should return UnauthorizedError without token', function(done) {
      server
        .del('/api/type/1')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.error.name.should.equal('UnauthorizedError');
          done();
        });
    });

    it('should return "invalid token" with invalid token', function(done) {
      server
        .del('/api/type/1')
        .set('Authorization', invalidToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('invalid token');
          done();
        });
    });
  });


  describe('GET /records', function() {
    it('should return UnauthorizedError without token', function(done) {
      server
        .get('/api/records')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.error.name.should.equal('UnauthorizedError');
          done();
        });
    });

    it('should return "invalid token" with invalid token', function(done) {
      server
        .get('/api/records')
        .set('Authorization', invalidToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('invalid token');
          done();
        });
    });
  });

  describe('POST /records', function() {
    var postValues = {
      long: 1234,
      lat: 4321,
      description: 'descriptive',
      severity: 3,
      user_id: 1,
      type_id: 1
    };
    it('should return UnauthorizedError without token', function(done) {
      server
        .post('/api/records')
        .send(postValues)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.error.name.should.equal('UnauthorizedError');
          done();
        });
    });

    it('should return "invalid token" with invalid token', function(done) {
      server
        .post('/api/records')
        .send(postValues)
        .set('Authorization', invalidToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('invalid token');
          done();
        });
    });
  });

  describe('PUT /record/:record_id', function() {
    var updateValues = {
      long: 1234,
      lat: 4321,
      description: 'new descriptive',
      severity: 2,
      user_id: 2,
      type_id: 1
    };
    it('should return UnauthorizedError without token', function(done) {
      server
        .put('/api/record/1')
        .send(updateValues)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.error.name.should.equal('UnauthorizedError');
          done();
        });
    });

    it('should return "invalid token" with invalid token', function(done) {
      server
        .put('/api/record/1')
        .send(updateValues)
        .set('Authorization', invalidToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('invalid token');
          done();
        });
    });
  });

  describe('DELETE /record/:record_id', function() {
    it('should return UnauthorizedError without token', function(done) {
      server
        .del('/api/record/1')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.error.name.should.equal('UnauthorizedError');
          done();
        });
    });

    it('should return "invalid token" with invalid token', function(done) {
      server
        .del('/api/record/1')
        .set('Authorization', invalidToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('invalid token');
          done();
        });
    });
  });
});
