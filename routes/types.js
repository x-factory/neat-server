var models = require('../models');
var express = require('express');
var api = express.Router();

api.route('/types')
  .get(function getType(req, res) {
    models.Type.findAll({
      include: [ models.Record ]
    }).then(function ffFindAllTypes(types) {
      res.status(201).json({ types: types });
    }).catch(function getTypeCatchAll(error) {
      res.status(500).json({ message: 'Error finding types', details: error });
    });
  })
  .post(function postType(req, res) {
    models.Type.create({
      name: req.body.name,
    }).then(function ffCreateType(type) {
      res.json({ message: 'Created type', type: type });
    }).catch(function postTypeCatchAll(error) {
      if (error.name == 'SequelizeValidationError') {
        res.status(400).json({ message: 'Invalid fields', details: error });
      } else {
        res.status(500).json({ message: 'Error creating type', details: error });
      }
    });
  });

api.route('/types/:type_id')
  .delete(function deleteType(req, res) {
    models.Type.destroy({
      where: {
        id: req.params.type_id
      }
    }).then(function ffDeleteType(type) {
      if (type === 0) {
        res.status(400).json({ message: 'Type does not exist' });
      } else {
        res.json({ message: 'Deleted type', type: type });
      }
    }).catch(function deleteTypeCatchAll(error) {
      res.status(500).json({  message: 'Failed to delete type', details: error });
    });
  });

module.exports = api;
