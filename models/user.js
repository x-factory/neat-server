var bcrypt = require('bcrypt-as-promised');

var SALT_ROUND = 10;

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      defaultValue: '', // for easier posting withtout a field
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: { isEmail: true },
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(60), // npm bcrypt
      validate: { notEmpty: true }
    },
    privilege: {
      type: DataTypes.ENUM,
      values: ['A', 'M'],
      defaultValue: 'M',
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, { // option object
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Record);
      }
    },
    instanceMethods: {
      comparePassword: function comparePassword(password) {
        var user = this;
        return bcrypt.compare(password, user.password);
      }
    },
    hooks: {
      beforeUpdate: function beforeUserUpdate(user, options) {
        function storeHashedPw(hash) {
          user.password = hash;
          user.active = true;
        }
        function hashingCatchAll(error) {
          console.error(error);
          user.password = null;
          user.active = false;
        }
        // to reset user, pass in both password and active
        if (user.password == 'null' && user.active == 'No') {
          user.password = null;
          user.active = false;
        } else {
          return bcrypt.hash(user.password, SALT_ROUND)
            .then(storeHashedPw).catch(hashingCatchAll);
        }
      }
    }
  });

  return User;
};
