require('dotenv').config();
var supertest = require('supertest');
var should = require('should');
var models = require('../models');
var server = supertest.agent('http://localhost:3000');

describe('/api/record*', function() {
  this.slow(250);
  var token;
  var newRecordId;
  var newLocationId;
  var recordValues = {
    long: -73.9741870,
    lat: 40.7711330,
    description: 'Not required',
    severity: 1,
    user_id: 1,
    type_id: 1
  };

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

    it('should return 400 if no longitude or latitude provided', function(done) {
      server
        .post('/api/records')
        .send({ severity: 1, user_id: 1, type_id: 1 })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function(err, res) {
          var errorMessage = 'notNull Violation: longitude cannot be null,' +
            '\nnotNull Violation: latitude cannot be null';
          res.status.should.equal(400);
          res.body.details.message.should.equal(errorMessage);
          done();
        });
    });

    it('should return 400 if submitting severity out of range', function(done) {
      recordValues.severity = 6;
      server
        .post('/api/records')
        .send(recordValues)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function(err, res) {
          var errors = res.body.details.errors;
          res.status.should.equal(400);
          errors[0].message.should.equal('Validation max failed');
          errors[0].path.should.equal('severity');
          recordValues.severity = 1;
          done();
        });
    });

    it('should return 500 if submitting user id that does not exist', function(done) {
      recordValues.user_id = 100;
      server
        .post('/api/records')
        .send(recordValues)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function(err, res) {
          res.status.should.equal(500);
          res.body.details.name.should.equal('SequelizeForeignKeyConstraintError');
          recordValues.user_id = 1;
          done();
        });
    });

    it('should return 500 if submitting type id that does not exist', function(done) {
      recordValues.type_id = 100;
      server
        .post('/api/records')
        .send(recordValues)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function(err, res) {
          res.status.should.equal(500);
          res.body.details.name.should.equal('SequelizeForeignKeyConstraintError');
          recordValues.type_id = 1;
          done();
        });
    });

    it('should return a proper record', function(done) {
      server
        .post('/api/records')
        .send(recordValues)
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
          models.Location.findById(newLocationId, { logging: false })
          .then(function(location) {
            location.longitude.should.equal(recordValues.long);
            location.latitude.should.equal(recordValues.lat);
            done();
          }).catch(function(error) {
            throw error;
          });
        });
    });

    it('should reuse location id if location already exist', function(done) {
      server
        .post('/api/records')
        .send(recordValues)
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


  describe('PUT /record/:record_id', function() {
    before(function() {
      recordValues.description = 'New description';
    });

    function confirmNotUpdated(done) {
      models.Record.findById(newRecordId, { logging: false })
      .then(function(record) {
        should(record.UserId).be.exactly(null);
        done();
      }).catch(function(error) {
        throw error;
      });
    }

    function confirmUpdated(done, userId) {
      models.Record.findById(newRecordId, { logging: false })
      .then(function(record) {
        record.UserId.should.equal(userId);
        record.description.should.equal('New description');
        done();
      }).catch(function(error) {
        throw error;
      });
    }

    it('should return 400 if record does not exist', function(done) {
      server
        .put('/api/record/100')
        .send(recordValues)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function(err, res) {
          res.status.should.equal(400);
          res.body.message.should.equal('Record does not exist');
          confirmNotUpdated(done);
        });
    });

    it('should return 400 if updating severity out of range', function(done) {
      recordValues.severity = 6;
      server
        .put('/api/record/' + newRecordId)
        .send(recordValues)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function(err, res) {
          var errors = res.body.details.errors;
          res.status.should.equal(400);
          errors[0].message.should.equal('Validation max failed');
          errors[0].path.should.equal('severity');
          recordValues.severity = 1;
          confirmNotUpdated(done);
        });
    });

    it('should return 500 if updating with user id that does not exist', function(done) {
      recordValues.user_id = 100;
      server
        .put('/api/record/' + newRecordId)
        .send(recordValues)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function(err, res) {
          res.status.should.equal(500);
          res.body.details.name.should.equal('SequelizeForeignKeyConstraintError');
          recordValues.user_id = 1;
          confirmNotUpdated(done);
        });
    });

    it('should return 500 if updating with type id that does not exist', function(done) {
      recordValues.type_id = 100;
      server
        .put('/api/record/' + newRecordId)
        .send(recordValues)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function(err, res) {
          res.status.should.equal(500);
          res.body.details.name.should.equal('SequelizeForeignKeyConstraintError');
          recordValues.type_id = 1;
          confirmNotUpdated(done);
        });
    });

    it('should resuse location if location already exist', function(done) {
      server
        .put('/api/record/' + newRecordId)
        .send(recordValues)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          var updatedRecord = res.body.affected[1][0];
          res.status.should.equal(200);
          updatedRecord.LocationId.should.equal(newLocationId);
          confirmUpdated(done, 1);
        });
    });

    it('should update record with new location', function(done) {
      recordValues.long = -123.1134790;
      recordValues.lat = 49.2414430;
      server
        .put('/api/record/' + newRecordId)
        .send(recordValues)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          var updatedRecord = res.body.affected[1][0];
          res.status.should.equal(200);
          updatedRecord.LocationId.should.not.equal(newLocationId);
          confirmUpdated(done, 1);
        });
    });

  });

});
