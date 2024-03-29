const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Level = sequelize.define(
    'Level',
    {
      level_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      levelname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Level Name is Required',
          },
          len: {
            args: [3,],
            msg: 'Level name must have at least 3 characters',
          },
        },
      },
      leveldescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
              msg: 'Level description is Required',
            }
        }
      },
    },
    {
      modelName: 'Level',
      freezeTableName: true,
      timestamps: false,
      hooks: {

      },
    }
  );
  
  // Associations
  Level.associate = (models) => {

    Level.hasMany(models.Paper, {
      foreignKey: 'level_id',
      as: 'Papers',
    });

    Level.hasMany(models.Order, {
      foreignKey: 'level_id',
      as: 'Orders',
    });

  };

  // Methods

  return Level;
};