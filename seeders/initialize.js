require('dotenv').config();
var models = require('../models');

var defaultTypes = [
  { name: 'Lighting' },
  { name: 'Garbage' },
  { name: 'Road Hazard' },
  { name: 'Housing' },
  { name: 'Graffiti' },
  { name: 'Driveway' }
];

var defaultAdmin = {
  name: 'X-Support',
  email: process.env.SUPPORT_EMAIL,
  privilege: 'A'
};

function initSequelize(done, err) {
  models.sequelize.sync({
    force: process.env.NODE_ENV === 'development'
  }).then(function() {

    return models.Type.count();

  }).then(function(count) {
    if (count > 0) {
      return count;
    }
    // create default types no type in database
    return models.Type.bulkCreate(defaultTypes);
  }).then(function(result) {
    // create default admin if not exist
    return models.User.findOrCreate({
      where: {
        email: defaultAdmin.email
      },
      defaults: defaultAdmin
    });
  }).spread(function(user, created) {
    if (created) {
      // set password for default admin
      return user.update({ password: process.env.SUPPORT_PASS });
    }
    return user;
  }).then(function(ready) {
    done();
  }).catch(function(error) {
    err(error);
  });
}

if (process.argv[2] === 'sync') {
  initSequelize(function() {
    console.log('DB SYNCED');
    process.exit();
  }, console.error);
}

module.exports = initSequelize;
