var models = require('../models');
var express = require('express');
var _ = require('lodash');
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
      // created user inactive by default therefore null password
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

api.route('/user/:user_id')
  .get(function(req, res) {
    models.User.findById(req.params.user_id)
      .then(function(user) {
        res.json({ user: user });
      });
  })
  .put(function putUser(req, res) {
    var userValues = {};
    var b = req.body;
    if (b.name)      userValues.name      = b.name;
    if (b.password)  userValues.password  = b.password;
    if (b.privilege) userValues.privilege = b.privilege;
    if (b.active)    userValues.active    = b.active;
    if (_.isEmpty(userValues)) {
      return res.status(400).json({ message: 'No input provided' });
    }
    models.User.update(userValues, {
      where: { id: req.params.user_id },
      individualHooks: true,
      returning: true
    }).then(function ffUpdateUser(affected) {
      if (affected[0] === 0) {
        res.status(400).json({ message: 'User does not exist' });
      } else {
        res.json({ message: 'Updated user', affected: affected });
      }
    }).catch(function putUserCatchAll(error) {
      res.status(500).json({ message: 'Error updating user', details: error });
    });
  })
  .delete(function deleteUser(req, res) {
    var hardDelete = false;
    var userId = req.params.user_id;
    models.Record.count({ // check if there are associated records
      where: {
        $or: [
          { CreatorId: userId },
          { UserId: userId }
        ]
      }
    }).then(function ffCount(count) {
      hardDelete = count === 0;
      return models.User.findById(userId);
    }).then(function ffFindUserById(user) {
      hardDelete = hardDelete || (user && user.active === null);
      var where = { where: { id: userId } };
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
        message: 'Error deleting user', details: error
      });
    });
  });

module.exports = api;
