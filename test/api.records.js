var supertest = require('supertest');
var should = require('should');
var server = supertest.agent('http://localhost:3000');

describe('/api/record*', function() {
  this.slow(250);
  var token;
  var newRecordId;

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


  describe('GET /records', function() {
    it('should return an array of records', function(done) {
      server
        .get('/api/records')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          res.status.should.equal(200);
          res.body.records.should.be.Array();
          done();
        });
    });
  });

  describe('POST /records', function() {
    // TODO location address
    var newLocationId;
    var postValues = {
      long: -73.9741870,
      lat: 40.7711330,
      description: 'Not required',
      severity: 1,
      user_id: 1,
      type_id: 1
    };

    it('should return 400 if submitting severity out of range', function(done) {
      postValues.severity = 6;
      server
        .post('/api/records')
        .send(postValues)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function(err, res) {
          res.status.should.equal(400);
          res.body.message.should.equal('Invalid fields');
          postValues.severity = 1;
          done();
        });
    });

    it('should return 500 if submitting user id that does not exist', function(done) {
      postValues.user_id = 100;
      server
        .post('/api/records')
        .send(postValues)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function(err, res) {
          res.status.should.equal(500);
          res.body.details.name.should.equal('SequelizeForeignKeyConstraintError');
          postValues.user_id = 1;
          done();
        });
    });

    it('should return 500 if submitting type id that does not exist', function(done) {
      postValues.type_id = 100;
      server
        .post('/api/records')
        .send(postValues)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function(err, res) {
          res.status.should.equal(500);
          res.body.details.name.should.equal('SequelizeForeignKeyConstraintError');
          postValues.type_id = 1;
          done();
        });
    });

    it('should return a proper record', function(done) {
      server
        .post('/api/records')
        .send(postValues)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function(err, res) {
          var record = res.body.record;
          res.status.should.equal(201);
          res.body.message.should.equal('Created record');
          record.description.should.equal('Not required');
          record.severity.should.equal(1);
          record.CreatorId.should.equal(1);
          should(record.UserId).be.exactly(null);
          newRecordId = record.id;
          newLocationId = record.LocationId;
          done();
        });
    });

    it('should reuse location id if location already exist', function(done) {
      server
        .post('/api/records')
        .send(postValues)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function(err, res) {
          var record = res.body.record;
          res.status.should.equal(201);
          res.body.message.should.equal('Created record');
          record.LocationId.should.equal(newLocationId);
          record.id.should.not.equal(newRecordId);
          done();
        });
    });

  });

});
