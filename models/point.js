const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Point = sequelize.define(
    'Point',
    {
      point_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pointname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Point Name is Required',
          },
          len: {
            args: [3,],
            msg: 'Point name must have at least 3 characters',
          },
        },
      },
      pointdescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
              msg: 'Point description is Required',
            }
        }
      },
    },
    {
      modelName: 'Point',
      freezeTableName: true,
      timestamps: false,
      hooks: {

      },
    }
  );
  
  // Associations
  Point.associate = (models) => {

  };

  // Methods

  return Point;
};