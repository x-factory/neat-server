var models = require('../models');
var express = require('express');
var api = express.Router();

api.route('/records')
.get(function(req, res) {
  models.Record.findAll({
    include: [
      { model: models.User, attributes: ['name', 'email', 'privilege'] },
      models.Location,
      models.Type
    ]
  }).then(function(records) {
    res.json({ records: records });
  }, function(error) {
    res.status(500).json({ message: 'Failed to find records', error: error });
  });
})
.post(function(req, res) {
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
  }).spread(function(location, created) {
    return models.Record.create({
      description: req.body.description,
      severity: req.body.severity,
      UserId: 1,
      LocationId: location.id,
      TypeId: req.body.type
    });
  }, function(error) {
    var failMessage = 'Failed to find or create location';
    if (error.name == 'SequelizeValidationError')
      return res.status(400).json({ message: failMessage, error: error });
    res.status(500).json({ message: failMessage, error: error });
  }).then(function(record) {
    res.status(201).json({ message: 'Created record', record: record });
  }, function(error) {
    var failMessage = 'Failed to create record';
    switch (error.name) {
      case 'SequelizeValidationError':
        res.status(400).json({ message: failMessage, error: error });
        break;
      default:
        res.status(500).json({ message: failMessage, error: error });
    }
  });
});

api.route('/records/:user_id')
.get(function(req, res) {
  models.Record.count({
    where: { UserId: req.params.user_id }
  }).then(function(count) {
    res.json({ count: count });
  }, function(error) {
    res.status(500).json(error);
  });
});

module.exports = api;
