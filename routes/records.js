var models = require('../models');
var express = require('express');
var api = express.Router();

api.route('/records')
  .get(function getRecord(req, res) {
    models.Record.findAll({
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['name', 'email']
        }, {
          model: models.User,
          as: 'lastEditedBy',
          attributes: ['name', 'email']
        },
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
        CreatorId: req.body.user_id,
        LocationId: location.id,
        TypeId: req.body.type_id
      });
    }).then(function ffCreateRecord(record) {
      res.status(201).json({ message: 'Created record', record: record });
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

api.route('/record/:record_id')
  .put(function putRecord(req, res) {
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
        UserId: req.body.user_id,
        LocationId: location.id,
        TypeId: req.body.type_id
      }, {
        where: { id: req.params.record_id },
        returning: true
      });
    }).then(function ffUpdateRecord(affected) {
      if (affected[0] === 0) {
        res.status(400).json({ message: 'Record does not exist' });
      } else {
        res.json({ message: 'Updated record', affected: affected });
      }
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
  })
  .delete(function deleteRecord(req, res) {
    var prevLocationId;
    var recordId = req.params.record_id;
    var recordStatus = {};
    models.Record.findById(recordId)
    .then(function ffFindRecordById(record) {
      if (record) {
        prevLocationId = record.LocationId;
      }
      return models.Record.destroy({ where: {id: recordId} });
    }).then(function ffDestroyRecord(result) {
      recordStatus.destroyed = result === 1;
      return models.Record.count({ // count associated location
        where: { LocationId: prevLocationId }
      });
    }).then(function ffCountRecord(count) {
      if (count === 0) { // no more associated records, delete location
        return models.Location.destroy({
          where: { id: prevLocationId }
        });
      }
      return false;
    }).then(function ffDestroyLocation(result) {
      recordStatus.locationDestroyed = result === 1;
      if (!recordStatus.destroyed) {
        res.status(400).json({
          message: 'Record does not exist', status: recordStatus
        });
      } else {
        res.json({ message: 'Deleted record', status: recordStatus });
      }
    }).catch(function deleteRecordCatchAll(error) {
      res.status(500).json({
        message: 'Error deleting record', details: error
      });
    });
  });

api.route('/records/:user_id')
  .get(function getRecordByUserId(req, res) {
    models.Record.findAll({
      where: {
        UserId: req.params.user_id
      }
    }).then(function ffFindRecordsByUserId(records) {
      res.json({ records: records });
    }).catch(function findRecordsByUserIdCatchAll(error) {
      res.status(500).json({
        message: 'Error finding records by user id ' + req.params.user_id,
        details: error
      });
    });
  });

module.exports = api;
