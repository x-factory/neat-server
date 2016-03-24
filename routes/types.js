var models = require('../models');
var express = require('express');
var api = express.Router();

api.route('/types')
.get(function(req, res) {
  models.Type.findAll({
    include: [ models.Record ]
  }).then(function(types) {
    res.status(201).json({ types: types });
  }).catch(function(error) {
    res.status(500).json({ message: 'Error finding types', error: error });
  });
})
.post(function(req, res) {
  models.Type.create({
    name: req.body.name,
  }).then(function(type) {
    res.json({ message: 'Created type', type: type });
  }, function(error) {
    var failMessage =  'Failed to create type';
    if (error.name == 'SequelizeValidationError')
      return res.status(400).json({ message: failMessage, error: error });
    res.status(500).json({ message: failMessage, error: error });
  });
});

api.route('/types/:type_id')
.delete(function(req, res) {
  models.Type.destroy({
    where: {
      id: req.params.type_id
    }
  }).then(function(type) {
    if (type === 0)
      return res.status(400).json({ message: 'Type does not exist' });
    res.json({ message: 'Deleted type', type: type });
  }, function(error) {
    res.status(500).json({  message: 'Failed to delete type', error: error });
  });
});

module.exports = api;
