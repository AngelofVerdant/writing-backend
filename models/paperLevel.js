const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PaperLevel = sequelize.define(
    'PaperLevel',
    {
      paper_level_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },  
    },
    {
      modelName: 'PaperLevel',
      freezeTableName: true,
      timestamps: false,
      hooks: {
        
      },
    }
  );

  // Associations
  PaperLevel.associate = (models) => {

    PaperLevel.belongsTo(models.Level, {
      foreignKey: 'level_id',
      as: 'Level',
    });

    PaperLevel.belongsTo(models.Paper, {
      foreignKey: 'paper_id',
      as: 'Paper',
    });

  };

  // Methods
  

  return PaperLevel;
};