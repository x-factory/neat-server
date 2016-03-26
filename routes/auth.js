var models = require('../models');
var express = require('express');
var bcrypt = require('bcrypt-as-promised');
var api = express.Router();

/* GET home page. */
api.post('/authenticate', function(req, res) {
  models.User.findOne({
    where: { email: req.body.email }
  }).then(function ffFindOneUser(user) {
    if (user) {
      return user.comparePassword(req.body.password);
    }
    return null;
  }).then(function ffComparePassword(result) {
    if (result) {
      res.json({ message: 'Success' });
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
