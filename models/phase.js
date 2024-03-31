const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Phase = sequelize.define(
    'Phase',
    {
      phase_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      phasename: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Phase Name is Required',
          },
          len: {
            args: [3,],
            msg: 'Phase name must have at least 3 characters',
          },
        },
      },
      phasedescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
              msg: 'Phase description is Required',
            }
        }
      },
    },
    {
      modelName: 'Phase',
      freezeTableName: true,
      timestamps: false,
      hooks: {

      },
    }
  );
  
  // Associations
  Phase.associate = (models) => {

  };

  // Methods

  return Phase;
};