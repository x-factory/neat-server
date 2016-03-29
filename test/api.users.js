require('dotenv').config();
var supertest = require('supertest');
var should = require('should');
var models = require('../models');
var server = supertest.agent('http://localhost:3000');

describe('/api/user*', function() {
  this.slow(250);
  var token;

  before(function(done) {
    models.User.create({
      email: 'member@neat.com'
    }, {
      logging: false
    }).then(function(user) {
      return user.update({ password: 'hunter2' }, { logging: false });
    }).then(function(result) {
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
    }).catch(function(error) {
      throw error;
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


  describe('POST /users', function() {
    var standardToken; // non admin
    before(function(done) {
      server
        .post('/api/authenticate')
        .send({ email: 'member@neat.com', password: 'hunter2' })
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          console.log(standardToken);
          standardToken = 'Bearer ' + res.body.token;
          done();
        });
    });

    it('should return error if email is invalid', function(done) {
      server
        .post('/api/users')
        .send({ email: 'email.address', name: 'newuser' })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function(err, res) {
          res.status.should.equal(400);
          res.body.message.should.equal('Invalid fields');
          done();
        });
    });

    it('should return error if email is not unique', function(done) {
      server
        .post('/api/users')
        .send({ email: 'test@neat.com', name: 'newuser' })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(409)
        .end(function(err, res) {
          res.status.should.equal(409);
          res.body.message.should.equal('Email exists');
          done();
        });
    });

    it('should return error if privilege is not a proper value', function(done) {
      server
        .post('/api/users')
        .send({ email: 'test@neat.com', name: 'newuser', privilege: 'X' })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function(err, res) {
          res.status.should.equal(500);
          res.body.message.should.equal('Error creating user');
          done();
        });
    });

    it('should return a proper non admin user', function(done) {
      server
        .post('/api/users')
        .send({ email: 'new@neat.com', name: 'newuser' })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function(err, res) {
          var user = res.body.user;
          res.status.should.equal(201);
          user.privilege.should.equal('M');
          user.active.should.equal(false);
          user.name.should.equal('newuser');
          user.email.should.equal('new@neat.com');
          should(user.password).be.exactly(null);
          done();
        });
    });

    it('shoudl return a proper admin user', function(done) {
      server
        .post('/api/users')
        .send({ email: 'admin@neat.com', name: 'admin', privilege: 'A' })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function(err, res) {
          var user = res.body.user;
          res.status.should.equal(201);
          user.privilege.should.equal('A');
          user.active.should.equal(false);
          user.name.should.equal('admin');
          user.email.should.equal('admin@neat.com');
          should(user.password).be.exactly(null);
          done();
        });
    });

    it('should only allow admin to add a user', function(done) {
      server
        .post('/api/users')
        .send({ email: 'new2@neat.com', name: 'new2' })
        .set('Authorization', standardToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          var user = res.body.user;
          res.status.should.equal(401);
          res.body.message.should.equal('User is not an admin');
          done();
        });
    });
  });

});
