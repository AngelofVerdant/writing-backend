const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Paper = sequelize.define(
    'Paper',
    {
      paper_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      papername: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Paper Name is Required',
          },
          len: {
            args: [3,],
            msg: 'Paper name must have at least 3 characters',
          },
        },
      },
      paperdescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
              msg: 'Paper description is Required',
            }
        }
      },
    },
    {
      modelName: 'Paper',
      freezeTableName: true,
      timestamps: false,
      hooks: {

      },
    }
  );
  
  // Associations
  Paper.associate = (models) => {

    Paper.belongsToMany(models.Level, {
      through: 'PaperLevel',
      foreignKey: 'paper_id',
      otherKey: 'level_id',
      as: 'Levels',
    });

    Paper.belongsToMany(models.Level, {
      through: 'PaperLevel',
      foreignKey: 'paper_id',
      otherKey: 'level_id',
      as: 'PaperLevels',
    });


    Paper.hasMany(models.PaperType, {
      foreignKey: 'paper_id',
      as: 'PaperTypes',
    });

    Paper.hasMany(models.Order, {
      foreignKey: 'paper_id',
      as: 'Orders',
    });

  };

  // Methods

  return Paper;
};