var supertest = require('supertest');
var should = require('should');
var server = supertest.agent('http://localhost:3000');

describe('/api/type*', function() {
  this.slow(250);
  var token;
  var newTypeId;

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

  describe('GET /types', function() {
    it('should return an array of types', function(done) {
      server
        .get('/api/types')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.types.should.be.Array();
          done();
        });
    });
  });


  describe('POST /types', function() {

    it('should catch invalid fields', function(done) {
      server
        .post('/api/types')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function(err, res) {
          res.status.should.equal(400);
          res.body.message.should.equal('Invalid fields');
          done();
        });
    });

    it('should be able to create a new type', function(done) {
      server
        .post('/api/types')
        .send({ name: 'New Type' })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function(err, res) {
          res.status.should.equal(201);
          res.body.message.should.equal('Created type');
          newTypeId = res.body.type.id;
          done();
        });
    });
    
  });


  describe('DELETE /type/:type_id', function() {

    it('should return 400 status if type does not exist', function(done) {
      server
        .del('/api/type/100')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function(err, res) {
          res.status.should.equal(400);
          res.body.message.should.equal('Type does not exist');
          done();
        });
    });

    it('should be able to delete a type', function(done) {
      server
        .del('/api/type/' + newTypeId)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.message.should.equal('Deleted type');
          done();
        });
    });

  });
});
