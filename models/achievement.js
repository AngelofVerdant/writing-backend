const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Achievement = sequelize.define(
    'Achievement',
    {
      orderscompleted: {
        type: DataTypes.INTEGER
      },
      satisfiedclients: {
        type: DataTypes.INTEGER
      },
      positivefeedbacks: {
        type: DataTypes.INTEGER
      },
      freebiesreleased: {
        type: DataTypes.INTEGER
      }
    },
    {
      modelName: 'Achievement',
      freezeTableName: true,
      timestamps: false,
      hooks: {
        async beforeBulkCreate() {
          throw new Error('Singleton constraint violation: Only one record allowed');
        },
        async beforeBulkUpdate() {
          throw new Error('Singleton constraint violation: Only one record allowed');
        },
        async beforeBulkDestroy() {
          throw new Error('Singleton constraint violation: Only one record allowed');
        }
      }
    }
  );

  Achievement.createSingleton = async function(data) {
    const existingRecord = await this.findOne();
    if (existingRecord) {
      throw new Error('Singleton constraint violation: Only one record allowed');
    }
    return this.create(data);
  };

  return Achievement;
};