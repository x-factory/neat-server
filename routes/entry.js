var models = require('../models');
var express = require('express');
var bcrypt = require('bcrypt-as-promised');
var jwt = require('jsonwebtoken');
var secret = process.env.JWT_SECRET;
var api = express.Router();

api
  .post('/authenticate', function postAuth(req, res) {
    var userInfo;
    models.User.findOne({
      where: {
        email: req.body.email
      }
    }).then(function ffFindOneUser(user) {
      if (user) {
        userInfo = {
          ownid: user.id,
          admin: user.privilege == 'A',
        };
        return user.comparePassword(req.body.password);
      }
      return null;
    }).then(function ffComparePassword(result) {
      if (result) {
        var token = jwt.sign(userInfo, secret, {
          expiresInMinutes: 1440
        });
        res.json({ message: 'Enjoy your token', token: token });
      } else {
        res.status(400).json({ message: 'Email does not exist' });
      }
    }).catch(bcrypt.MISMATCH_ERROR, function handleInvalidPassword(error) {
      res.status(400).json({ message: 'Invalid password', details: error });
    }).catch(function authenticateCatchAll(error) {
      res.status(500).json({ message: 'Error authenticating', details: error });
    });
  })
  .put('/register', function putRegister(req, res) {
    var b = req.body;

    if (!b.password || !b.confirm) {
      return res.status(400).json({ message: 'No passwords provided' });
    } else if (b.password !== b.confirm) {
      return res.status(400).json({ message: 'Mismatched passwords' });
    }

    models.User.findOne({
      where: {
        email: req.body.email
      }
    }).then(function ffFindUserByEmail(user) {
      if (user) {
        var userValues = {
          email: b.email,
          password: b.password
        };
        if (b.name) {
          userValues.name = b.name;
        }
        return models.User.update(userValues, {
          where: { id: user.id },
          individualHooks: true,
          returning: true
        });
      }
      return null;
    }).then(function ffUpdateUser(result) {
      if (result) {
        res.json({
          message: 'Updated user password and active status',
          result: result
        });
      } else {
        res.status(400).json({ message: 'Email does not exist' });
      }
    }).catch(function putRegisterCatchAll(error) {
      res.status(500).json({
        message: 'Error registering user',
        details: error
      });
    });
  });

module.exports = api;
