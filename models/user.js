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
    password: DataTypes.STRING(60), // npm bcrypt
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
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Record);
      }
    }
  });

  return User;
};
