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
        Record.belongsTo(models.User, {
          as: 'createdBy', foreignKey: 'CreatorId'
        });
        Record.belongsTo(models.User, {
          as: 'lastEditedBy', foreignKey: 'UserId'
        });
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
