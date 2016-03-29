require('dotenv').config();
var supertest = require('supertest');
var should = require('should');
var models = require('../models');
var server = supertest.agent('http://localhost:3000');

describe('/api/user*', function() {
  this.slow(250);
  var token;
  var standardToken; // non admin
  var newuserId;

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
          newuserId = user.id;
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
          res.status.should.equal(401);
          res.body.message.should.equal('User is not an admin');
          done();
        });
    });
  });


  describe('PUT /user/:user_id', function() {

    it('should return 400 status if no input provided', function(done) {
      server
        .put('/api/user/1')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function(err, res) {
          res.status.should.equal(400);
          res.body.message.should.equal('No input provided');
          done();
        });
    });

    it('should return 401 status if non admin try to update privilege', function(done) {
      server
        .put('/api/user/2')
        .send({ privilege: 'A' })
        .set('Authorization', standardToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('User is not an admin');
          done();
        });
    });

    it('should return 401 status if non admin try to reset password', function(done) {
      server
        .put('/api/user/2')
        .send({ password: 'null', active: 'No' })
        .set('Authorization', standardToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('User is not an admin');
          done();
        });
    });

    it('should return 401 status if a user try to update another\'s name', function(done) {
      server
        .put('/api/user/2')
        .send({ name: 'awesome' })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('Can only self-rename');
          done();
        });
    });

    it('should retrun 400 status if a user does not exist', function(done) {
      server
        .put('/api/user/100')
        .send({ privilege: 'A' })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function(err, res) {
          res.status.should.equal(400);
          res.body.message.should.equal('User does not exist');
          done();
        });
    });

    // TODO only self set password (without using user/1 token)
    it('should be able to set a user\'s password', function(done) {
      server
        .put('/api/user/' + newuserId) // newuser
        .send({ password: 'newpassword' })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          var affected = res.body.affected;
          var affectedUser = affected[1][0];
          res.status.should.equal(200);
          res.body.message.should.equal('Updated user');
          affected[0].should.equal(1);
          affectedUser.password.length.should.equal(60);
          affectedUser.active.should.equal(true);
          done();
        });
    });

    it('should be able to reset a user\'s password', function(done) {
      server
        .put('/api/user/' + newuserId) // newuser
        .send({ password: 'null', active: 'No' })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          var affected = res.body.affected;
          var affectedUser = affected[1][0];
          res.status.should.equal(200);
          res.body.message.should.equal('Updated user');
          affected[0].should.equal(1);
          should(affectedUser.password).be.exactly(null);
          affectedUser.active.should.equal(false);
          done();
        });
    });

  });


  describe('DELETE /user/:user_id', function() {
    before(function(done) {
      models.Location.create({
        longitude: 12345,
        latitude: 54312
      }, {
        logging: false
      }).then(function(location) {
        return models.Record.create({
          severity: 3,
          CreatorId: 2,
          LocationId: location.id,
          TypeId: 1
        }, { logging: false });
      }).then(function(record) {
        done();
      }).catch(function(error) {
        throw error;
      });
    });

    it('should only allow admin to delete a user', function(done) {
      server
        .del('/api/user/' + newuserId) // newuser
        .set('Authorization', standardToken)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function(err, res) {
          res.status.should.equal(401);
          res.body.message.should.equal('User is not an admin');
          done();
        });
    });

    it('should retrun 400 status if a user does not exist', function(done) {
      server
        .del('/api/user/100')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function(err, res) {
          res.status.should.equal(400);
          res.body.message.should.equal('User does not exist');
          done();
        });
    });

    it('should perform soft delete if user has associated records', function(done) {
      server
        .del('/api/user/2')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.message.should.equal('Disabled user (active -> null)');
          done();
        });
    });

    it('should perform hard delete if user has no associated records', function(done) {
      server
        .del('/api/user/2')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.message.should.equal('Deleted user');
          done();
        });
    });

  });
});
