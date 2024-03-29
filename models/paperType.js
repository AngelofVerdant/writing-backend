const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PaperType = sequelize.define(
    'PaperType',
    {
      paper_type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      papertypename: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'PaperType Name is Required',
          },
          len: {
            args: [3,],
            msg: 'PaperType name must have at least 3 characters',
          },
        },
      },
      papertypedescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
              msg: 'PaperType description is Required',
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
      modelName: 'PaperType',
      freezeTableName: true,
      timestamps: false,
      hooks: {

      },
    }
  );
  
  // Associations
  PaperType.associate = (models) => {

    PaperType.belongsTo(models.Paper, {
        foreignKey: 'paper_id',
        as: 'Paper',
    });

    PaperType.hasMany(models.Order, {
      foreignKey: 'paper_type_id',
      as: 'Orders',
    });

  };

  // Methods

  return PaperType;
};