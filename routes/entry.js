var models = require('../models');
var express = require('express');
var bcrypt = require('bcrypt-as-promised');
var jwt = require('jsonwebtoken');
var secret = process.env.JWT_SECRET;
var api = express.Router();

api.post('/authenticate', function(req, res) {
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
        expiresInMinutes: 120
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
});

module.exports = api;
