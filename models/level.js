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
      priceperpage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          notEmpty: {
            msg: 'Price per page is required.',
          },
        },
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

    Level.belongsToMany(models.Paper, {
      through: 'PaperLevel',
      foreignKey: 'level_id',
      otherKey: 'paper_id',
      as: 'LevelPapers',
    });

    Level.hasMany(models.Order, {
      foreignKey: 'level_id',
      as: 'Orders',
    });

  };

  // Methods

  return Level;
};