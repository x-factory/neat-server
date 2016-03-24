module.exports = function(sequelize, DataTypes) {
  var Type = sequelize.define('Type', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: false,
    classMethods: {
      associate: function(models) {
        Type.hasMany(models.Record);
      }
    }
  });

  return Type;
};
