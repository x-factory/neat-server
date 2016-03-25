var models = require('../models');
var express = require('express');
var api = express.Router();

api.route('/records')
  .get(function getRecord(req, res) {
    models.Record.findAll({
      include: [
        { model: models.User, attributes: ['name'] },
        models.Location,
        models.Type
      ]
    }).then(function ffFindAllRecords(records) {
      res.json({ records: records });
    }).catch(function getRecordCatchAll(error) {
      res.status(500).json({ message: 'Error finding records', error: error });
    });
  })
  .post(function postRecord(req, res) {
    var defaultLocation = {
      longitude: req.body.long,
      latitude: req.body.lat
    };
    if (req.body.address) defaultLocation.address = req.body.address;
    models.Location.findOrCreate({
      where: {
        longitude: req.body.long,
        latitude: req.body.lat
      },
      defaults: defaultLocation
    }).spread(function ffFindOrCreateLocation(location, created) {
      return models.Record.create({
        description: req.body.description,
        severity: req.body.severity,
        LocationId: location.id,
        TypeId: req.body.type
      });
    }).then(function ffCreateRecord(record) {
      return record.addUser([req.body.user_id]);
    }).then(function ffAddUserToRecord(userRecord) {
      res.status(201).json({
        message: 'Created user record',
        userRecord: userRecord
      });
    }).catch(function postRecordCatchAll(error) {
      switch (error.name) {
        case 'SequelizeValidationError':
          res.status(400).json({ message: 'Invalid fields', details: error });
          break;
        default:
          res.status(500).json({
            message: 'Error creating record', details: error
          });
      }
    });
  });

api.route('/records/:record_id')
  .put(function putRecrodById(req, res) {
    var defaultLocation = {
      longitude: req.body.long,
      latitude: req.body.lat
    };
    if (req.body.address) defaultLocation.address = req.body.address;
    models.Location.findOrCreate({
      where: {
        longitude: req.body.long,
        latitude: req.body.lat
      },
      defaults: defaultLocation
    }).spread(function ffFindOrCreateLocation(location, created) {
      return models.Record.update({
        description: req.body.description,
        severity: req.body.severity,
        LocationId: location.id,
        TypeId: req.body.type
      }, {
        where: { id: req.params.record_id },
        returning: true
      });
    }).then(function ffUpdateRecord(affected) {
      var record = affected[1][0];
      return record.hasUser([req.body.user_id]).then(function(result) {
        if (result) {
          return record;
        }
        return record.addUser([req.body.user_id]);
      });
    }).then(function ffAddUserToRecord(userRecord) {
      res.json({ message: 'Updated user record', userRecord: userRecord });
    }).catch(function putRecordCatchAll(error) {
      switch (error.name) {
        case 'SequelizeValidationError':
          res.status(400).json({ message: 'Invalid fields', details: error });
          break;
        default:
          res.status(500).json({
            message: 'Error updating record', details: error
          });
      }
    });
  });

module.exports = api;
