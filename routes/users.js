var models = require('../models');
var express = require('express');
var api = express.Router();

api.route('/users')
  .get(function getUser(req, res) {
    models.User.findAll({
      include: [ models.Record ]
    }).then(function ffFindAllUsers(users) {
      res.json({ users: users });
    }).catch(function getUserCatchAll(error) {
      res.status(500).json({ message: 'Error finding user', details: error });
    });
  })
  .post(function postUser(req, res) {
    models.User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      privilege: req.body.privilege
      // when first created, default to active: false
    }).then(function ffCreateUser(user) {
      res.status(201).json({
        message: 'Created user', user: user
      });
    }).catch(function postUserCatchAll(error) {
      switch (error.name) {
        case 'SequelizeValidationError':
          res.status(400).json({ message: 'Invalid fields', details: error });
          break;
        case 'SequelizeUniqueConstraintError':
          res.status(409).json({ message: 'Email exists', details: error });
          break;
        default:
          res.status(500).json({
            message: 'Error creating user', details: error
          });
      }
    });
  });

api.route('/users/:user_id')
  .get(function(req, res) {
    models.User.findById(req.params.user_id)
      .then(function(user) {
        res.json({ user: user });
      });
  })
  .delete(function deleteUser(req, res) {
    var hardDelete = false;
    models.User.findById(req.params.user_id)
    .then(function ffFindUserById(user) {
      hardDelete = user && user.active === null; 
      return user
        ? user.countRecords()
        : 0;
    }).then(function ffCountRecords(count) {
      hardDelete = hardDelete || count === 0;
      var where = { where: { id: req.params.user_id } };
      return hardDelete // set acitve to null as soft delete
        ? models.User.destroy(where)
        : models.User.update({ active: null }, where);
    }).then(function ffHardOrSoftDeleteUser(result) {
      if (result === 0) {
        res.status(400).json({ message: 'User does not exist' });
      } else if (result === 1) { // hard delete successful
        res.json({ message: 'Deleted user' });
      } else { // soft delete successful
        res.json({ message: 'Disabled user (active -> null)', user: result });
      }
    }).catch(function deleteUserCatchAll(error) {
      res.status(500).json({
        message: 'Failed to delete user', details: error
      });
    });
  });

module.exports = api;
