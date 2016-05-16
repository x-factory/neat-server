var models = require('../models');
var express = require('express');
var _ = require('lodash');
var api = express.Router();

function adminRequired(req, res, next) {
  if (!req.user.admin) {
    return res.status(401).json({ message: 'User is not an admin' });
  }
  return next();
}

api.get('/me', function getMe(req, res) {
  models.User.findById(req.user.ownid, {
    attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
  })
    .then(function ffFindMe(user) {
      res.json({ user: user });
    }).catch(function findMeCatchAll(error) {
      res.status(500).json({
        message: 'Failed to find me',
        details: error
      });
    });
});

api.route('/users')
  .get(function getUser(req, res) {
    var where = { disabled: false };
    if (req.query.disabled == 1) {
      where.disabled = true;
    }
    models.User.findAll({
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      where: where,
      order: [ ['id'] ]
    }).then(function ffFindAllUsers(users) {
      res.json({ users: users });
    }).catch(function getUserCatchAll(error) {
      res.status(500).json({ message: 'Error finding user', details: error });
    });
  })
  .post(adminRequired, function postUser(req, res) {
    models.User.create({
      name: req.body.name,
      email: req.body.email,
      // created user inactive by default therefore null password
      privilege: req.body.privilege
      // when first created, active and disabled default to false
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
  })
  .delete(adminRequired, function deleteUsers(req, res) {
    models.User.destroy({
      where: {
        disabled: true
      }
    }).then(function ffDeleteUsers(affected) {
      res.json({
        message: 'Deleted all disabled users',
        affected: affected
      });
    }).catch(function deleteUsersCatchAll(error) {
      res.status(500).json({
        message: 'Failed to delete all disabled users',
        details: error
      });
    });
  });

api.route('/user/:user_id')
  // testing route, no use atm
  .get(function(req, res) {
    models.User.findById(req.params.user_id)
      .then(function(user) {
        res.json({ user: user });
      });
  })
  .put(function putUserRuleCheck(req, res, next) {
    var userValues = {};
    var b = req.body;
    req.pwHook = false;
    if (b.name)      userValues.name      = b.name;
    if (b.privilege) userValues.privilege = b.privilege;
    if (b.active)    userValues.active    = b.active;
    if (b.disabled)  userValues.disabled  = b.disabled;
    if (b.password)  {
      userValues.password = b.password;
      req.pwHook = true;
    }
    if (_.isEmpty(userValues)) {
      return res.status(400).json({ message: 'No input provided' });
    }
    var isAdminAction = b.privilege || b.active || b.disabled;
    if (isAdminAction && !req.user.admin) {
      return res.status(401).json({ message: 'User is not an admin' });
    }
    if (b.name && req.params.user_id != req.user.ownid) {
      return res.status(401).json({ message: 'Can only self-rename' });
    }
    req.newUserValues = userValues;
    return next();
  }, function putUser(req, res) {
    models.User.update(req.newUserValues, {
      where: { id: req.params.user_id },
      individualHooks: req.pwHook,
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
  .delete(adminRequired, function deleteUser(req, res) {
    var hardDelete = false;
    var userId = req.params.user_id;
    if (userId == 1) {
      return res.status(401).json({ message: 'Cannot delete superuser' });
    }
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
      hardDelete = hardDelete || (user && user.disabled);
      var where = { where: { id: userId } };
      return hardDelete // set acitve to null as soft delete
        ? models.User.destroy(where)
        : models.User.update({ disabled: true }, where);
    }).then(function ffHardOrSoftDeleteUser(result) {
      if (result === 0) {
        res.status(400).json({ message: 'User does not exist' });
      } else if (result === 1) { // hard delete successful
        res.json({ message: 'Deleted forever' });
      } else { // soft delete successful
        res.json({ message: 'Disabled user', user: result });
      }
    }).catch(function deleteUserCatchAll(error) {
      res.status(500).json({
        message: 'Error deleting user', details: error
      });
    });
  });

module.exports = api;
