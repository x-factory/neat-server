module.exports = function(sequelize, DataTypes) {
  var Record = sequelize.define('Record', {
    description: DataTypes.TEXT,
    severity: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 },
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        Record.belongsToMany(models.User, { through: 'UserRecord' });
        Record.belongsTo(models.Location, {
          foreignKey: { allowNull: false }
        });
        Record.belongsTo(models.Type, {
          foreignKey: { allowNull: false }
        });
      }
    }
  });

  return Record;
};
