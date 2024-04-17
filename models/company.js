const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Company = sequelize.define(
    'Company',
    {
      companyname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Company Name is Required',
          },
        },
      },
      companyemail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Company Email is Required',
          },
        },
      },
      companyphone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Company Phone is Required',
          },
        },
      },
      companytwitterlink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      companyfacebooklink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      defaultimage: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: { 
          secure_url: '#', 
          public_id: '#',
         },
      },
      images: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      modelName: 'Company',
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

  Company.createSingleton = async function(data) {
    const existingRecord = await this.findOne();
    if (existingRecord) {
      throw new Error('Singleton constraint violation: Only one record allowed');
    }
    return this.create(data);
  };

  return Company;
};