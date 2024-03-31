const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Essay = sequelize.define(
    'Essay',
    {
      essay_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      essayname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Essay Name is Required',
          },
          len: {
            args: [3,],
            msg: 'Essay name must have at least 3 characters',
          },
        },
      },
      essaydescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
              msg: 'Essay description is Required',
            }
        }
      },
    },
    {
      modelName: 'Essay',
      freezeTableName: true,
      timestamps: false,
      hooks: {

      },
    }
  );
  
  // Associations
  Essay.associate = (models) => {

  };

  // Methods

  return Essay;
};