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
        TypeId: req.body.type
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
        TypeId: req.body.type
      }, {
        where: { id: req.params.record_id },
        returning: true
      });
    }).then(function ffUpdateRecord(affected) {
      res.json({ message: 'Updated record', affected: affected });
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
