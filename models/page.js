const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Page = sequelize.define(
    'Page',
    {
      page_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pagename: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Page Name is Required',
          },
          len: {
            args: [3,],
            msg: 'Page name must have at least 3 characters',
          },
        },
      },
      pagedescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
              msg: 'Page description is Required',
            }
        }
      },
      pagelink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      modelName: 'Page',
      freezeTableName: true,
      timestamps: false,
      hooks: {
        beforeCreate: async (page, options) => {
          generateLink(page);
        },
        beforeUpdate: async (page, options) => {
          generateLink(page);
        },
      },
    }
  );
  
  // Associations
  Page.associate = (models) => {

  };

  // Methods
  function generateLink(page) {
    if (page.pagename) {
      page.pagelink = page.pagename
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    }
  }

  return Page;
};