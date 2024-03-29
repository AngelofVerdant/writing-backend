const { Order } = require('../models');
const logger = require('../utils/logger');

const getOrdersWithPagination = async ({ user_id, sortOrder, filters, searchRegex, skip, limit }) => {
  try {
    const whereClause = {
        user_id: user_id,
    };

    if (filters) {
      for (const key in filters) {
        switch (key) {
          case 'customFilter':
            break;
          default:
            console.warn(`Unknown filter key: ${key}`);
            break;
        }
      }
    }

    if (searchRegex) {
      whereClause.ordertitle = searchRegex;
    }

    const [totalCount, orders] = await Promise.all([
        Order.count({
          where: whereClause
        }),
        Order.findAll({
          attributes: ['order_id', 'ordertitle', 'orderpaymentstatus', 'orderprice', 'orderstatus'],
          where: whereClause,
          order: [['ordertitle', sortOrder]],
          limit: limit,
          offset: skip,
          distinct: true,
        }),
    ]);

    return {
      totalCount: totalCount,
      count: orders.length,
      orders: orders.map(order => ({
        id: order.order_id,
        title: order.ordertitle,
        payment: order.orderpaymentstatus.id,
        price: order.orderprice,
        stage: order.orderstatus.title,
      })),
    };
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getAdminOrdersWithPagination = async ({ sortOrder, filters, searchRegex, skip, limit }) => {
  try {
    const whereClause = {};

    if (filters) {
      for (const key in filters) {
        switch (key) {
          case 'customFilter':
            break;
          default:
            console.warn(`Unknown filter key: ${key}`);
            break;
        }
      }
    }

    if (searchRegex) {
      whereClause.ordertitle = searchRegex;
    }

    const [totalCount, orders] = await Promise.all([
        Order.count({
          where: whereClause
        }),
        Order.findAll({
          attributes: ['order_id', 'ordertitle', 'orderstatus', 'orderprice', 'orderpaymentstatus'],
          where: whereClause,
          order: [['ordertitle', sortOrder]],
          limit: limit,
          offset: skip,
          distinct: true,
        }),
    ]);

    return {
      totalCount: totalCount,
      count: orders.length,
      orders: orders.map(order => ({
        id: order.order_id,
        title: order.ordertitle,
        price: order.orderprice,
        status: order.orderstatus,
        payment: order.orderpaymentstatus,
      })),
    };
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getOrder = async ({ orderId = null, user_id }) => {
  try {
    if (orderId === null || isNaN(orderId)) {
      throw new Error('Order ID must be a valid number');
    }

    const [order] = await Promise.all([
        Order.findOne({
          attributes: [
            'order_id', 
            'ordertitle', 
            'orderdescription',
            'orderspace',
            'orderdeadline',
            'orderlanguage',
            'orderformat',
            'orderpages',
            'ordersources',
            'orderstatus',
            'orderpaymentstatus',
            'orderprice',
            'orderdefaultimage',
            'orderimages'
        ],
          where: {
            order_id: orderId,
            user_id: user_id
          }
        }),
    ]);

    if (!order) {
      return next(new ErrorResponse(`Order not found with ID ${orderId}`, 404));
    }

    return order;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

module.exports = {
    getOrdersWithPagination,
    getAdminOrdersWithPagination,
    getOrder,
};