var models = require('../models');

var fakeUsers = [
  {
    name: 'David Parsons',
    email: 'David.Parsons@GeorgianCollege.ca',
    privilege: 'A',
    password: 'supersecret',
    active: true
  },
  {
    name: 'Martin Pennock',
    email: 'martin@gmail.com',
    privilege: 'A',
    password: 'supersecret',
    active: true
  },
  {
    name: 'Slevin Zhang',
    email: 'slevin@gmail.com',
    privilege: 'M',
    active: false
  },
  {
    name: 'Random Name',
    email: 'random@random.org',
    privilege: 'M',
    password: 'supersecret',
    active: true
  },
  {
    name: 'John Shaw',
    email: 'john@gmail.com',
    privilege: 'A',
    active: false
  },
  {
    name: 'Rich Freeman',
    email: 'rich@gmail.com',
    privilege: 'M',
    password: 'supersecret',
    active: true
  },
  {
    name: 'Bill Gates',
    email: 'bill@outlook.com',
    privilege: 'A',
    password: 'supersecret',
    disabled: true
  },
  {
    name: 'Steve Jobs',
    email: 'stevejobs@apple.heaven',
    privilege: 'M',
    disabled: true
  },
  {
    name: 'Scott McDonald',
    email: 'scott@McDonald.com',
    privilege: 'M',
    password: 'supersecret',
    active: true
  }
];

module.exports = function createFakeUsers(done) {
  models.User.bulkCreate(fakeUsers).then(function(result) {
    console.log('----> CREATED A LOT of USERS <-----');
    done();
  }).catch(function(error) {
    console.error('failed to create a lot of users =======');
  });
};
