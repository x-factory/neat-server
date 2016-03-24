module.exports = function(sequelize, DataTypes) {
  var Location = sequelize.define('Location', {
    address: DataTypes.STRING,
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  }, {
    timestamps: false,
    classMethods: {
      associate: function(models) {
        Location.hasMany(models.Record);
      }
    }
  });

  return Location;
};
