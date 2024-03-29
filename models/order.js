const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define(
    'Order',
    {
      order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ordertitle: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Order Title is Required',
          },
          len: {
            args: [3,],
            msg: 'Order title must have at least 3 characters',
          },
        },
      },
      writer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      orderdescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
              msg: 'Order description is Required',
            }
        }
      },
      orderspace: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Order Spacing is required.',
          },
          isIn: {
            args: [
              [
                { id: 1, title: 'Double Spacing' },
                { id: 2, title: 'Single Spacing' },
              ]
            ],
            msg: 'Order Spacing unit type.',
          },
        },
      },
      orderdeadline: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Order deadline is required.',
          },
          isIn: {
            args: [
              [
                { id: 1, title: '3 hours', price: 20 },
                { id: 2, title: '8 hours', price: 18 },
                { id: 3, title: '12 hours', price: 16 },
                { id: 4, title: '24 hours', price: 14 },
                { id: 5, title: '2 days', price: 12 },
                { id: 6, title: '3 days', price: 10 },
                { id: 7, title: '5 days', price: 8 },
                { id: 8, title: '7 days', price: 6 },
                { id: 9, title: '10 days', price: 4 },
                { id: 10, title: '20 days', price: 2 },
                { id: 11, title: '30 days', price: 0 },
              ]
            ],
            msg: 'Order deadline unit type.',
          },
        },
      },
      orderlanguage: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Order language is required.',
          },
          isIn: {
            args: [
              [
                { id: 1, title: 'English (U.S)' },
                { id: 2, title: 'English (U.K)' },
              ]
            ],
            msg: 'Order language unit type.',
          },
        },
      },
      orderformat: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Order format is required.',
          },
          isIn: {
            args: [
              [
                { id: 1, title: 'APA' },
                { id: 2, title: 'CBE' },
                { id: 3, title: 'Chicago' },
                { id: 4, title: 'Harvard' },
                { id: 5, title: 'MLA' },
                { id: 6, title: 'OxFord' },
                { id: 7, title: 'Turabian' },
                { id: 8, title: 'Vancouver' },
                { id: 9, title: 'Other' },
              ]
            ],
            msg: 'Order format unit type.',
          },
        },
      },
      orderpages: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          notEmpty: {
            msg: 'Order Pages is required.',
          },
        },
      },
      ordersources: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          notEmpty: {
            msg: 'Order Sources is required.',
          },
        },
      },
      orderstatus: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Order Status is required.',
          },
          isIn: {
            args: [
              [
                { id: 1, title: 'Pending' },
                { id: 2, title: 'In Progress' },
                { id: 3, title: 'Completed' },
              ]
            ],
            msg: 'Invalid order status.',
          },
        },
      },
      orderpaymentstatus: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Order payment status is required.',
          },
          isIn: {
            args: [
              [
                { id: 1, title: 'Unpaid' },
                { id: 2, title: 'Paid' },
              ]
            ],
            msg: 'Invalid order payment status.',
          },
        },
      },
      orderprice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          notEmpty: {
            msg: 'Order total Price is required.',
          },
        },
      },
      orderdefaultimage: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: { 
          secure_url: '#', 
          public_id: '#',
         },
      },
      orderimages: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      modelName: 'Order',
      freezeTableName: true,
      timestamps: false,
      hooks: {

      },
    }
  );
  
  // Associations
  Order.associate = (models) => {

    Order.belongsTo(models.Level, {
        foreignKey: 'level_id',
        as: 'Level',
    });

    Order.belongsTo(models.Paper, {
        foreignKey: 'paper_id',
        as: 'Paper',
    });

    Order.belongsTo(models.PaperType, {
        foreignKey: 'paper_type_id',
        as: 'PaperType',
    });

    Order.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'User',
    });

  };

  // Methods

  return Order;
};