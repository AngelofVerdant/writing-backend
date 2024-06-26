const { Order, Level, Paper, PaperType, sequelize } = require('../models');
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
        stagetitle: order.orderstatus.title,
        stageid: order.orderstatus.id,
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

const getWriterOrdersWithPagination = async ({ user_id, sortOrder, filters, searchRegex, skip, limit }) => {
  try {
    const whereClause = {
      writer_id: user_id,
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

    const [totalCount, assignments] = await Promise.all([
        Order.count({
          where: whereClause
        }),
        Order.findAll({
          attributes: ['order_id', 'ordertitle', 'orderstatus'],
          where: whereClause,
          order: [['ordertitle', sortOrder]],
          limit: limit,
          offset: skip,
          distinct: true,
        }),
    ]);

    return {
      totalCount: totalCount,
      count: assignments.length,
      assignments: assignments.map(assignment => ({
        id: assignment.order_id,
        title: assignment.ordertitle,
        stagetitle: assignment.orderstatus.title,
        stageid: assignment.orderstatus.id,
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
            'orderdefaultdocument',
            'orderdocuments'
        ],
          where: {
            order_id: orderId,
            user_id: user_id
          }
        }),
    ]);

    return order;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getOrderByIdWriter = async ({ orderId = null, user_id, next }) => {
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
            'orderdefaultuploaddocument',
            'orderuploaddocuments'
        ],
          where: {
            order_id: orderId,
            writer_id: user_id
          }
        }),
    ]);

    return order;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getWriterOrder = async ({ orderId = null, user_id }) => {
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
            'orderdefaultdocument', 
            'orderdocuments'
          ],
          where: {
            order_id: orderId,
            writer_id: user_id
          },
          include: [
            {
                model: Level,
                as: 'Level',
                attributes: ['level_id', 'levelname'],
            },
            {
                model: Paper,
                as: 'Paper',
                attributes: ['paper_id', 'papername'],
            },
            {
                model: PaperType,
                as: 'PaperType',
                attributes: ['paper_type_id', 'papertypename'],
            },
          ],
        }),
    ]);

    return order;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getUserOrder = async ({ orderId = null, user_id }) => {
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
            'orderdefaultuploaddocument', 
            'orderuploaddocuments'
          ],
          where: {
            order_id: orderId,
            user_id: user_id
          },
          include: [
            {
                model: Level,
                as: 'Level',
                attributes: ['level_id', 'levelname'],
            },
            {
                model: Paper,
                as: 'Paper',
                attributes: ['paper_id', 'papername'],
            },
            {
                model: PaperType,
                as: 'PaperType',
                attributes: ['paper_type_id', 'papertypename'],
            },
          ],
        }),
    ]);

    return order;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getCustomerStats = async ({ user_id }) => {
  try {
    const [totalOrders, statusDistribution, totalPaidOrders ] = await Promise.all([
      Order.count({
        where: {
          user_id: user_id,
        }
      }),
      Order.findAll({
        attributes: ['orderstatus', [sequelize.fn('COUNT', sequelize.col('orderstatus')), 'count']],
        group: ['orderstatus'],
        where: {
          user_id: user_id
        }
      }),
      Order.count({
        where: {
          orderpaymentstatus: { id: 2 },
          user_id: user_id,
        }
      }),
    ]);

    const totalUnpaidOrders = totalOrders - totalPaidOrders;
    const paymentStatusPercentage = {
      paid: (totalPaidOrders / totalOrders) * 100,
      unpaid: (totalUnpaidOrders / totalOrders) * 100
    };

    return {
      orderVolume: totalOrders,
      orderStatusDistribution: statusDistribution,
      orderPaymentStatus: paymentStatusPercentage
    };
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getWriterStats = async ({ writer_id }) => {
  try {
    const [totalOrders, statusDistribution] = await Promise.all([
      Order.count({
        where: {
          writer_id: writer_id,
        }
      }),
      Order.findAll({
        attributes: ['orderstatus', [sequelize.fn('COUNT', sequelize.col('orderstatus')), 'count']],
        group: ['orderstatus'],
        where: {
          writer_id: writer_id
        }
      }),
    ]);

    return {
      orderVolume: totalOrders,
      orderStatusDistribution: statusDistribution,
    };
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};


module.exports = {
    getOrdersWithPagination,
    getAdminOrdersWithPagination,
    getWriterOrdersWithPagination,
    getOrder,
    getOrderByIdWriter,
    getWriterOrder,
    getUserOrder,
    getCustomerStats,
    getWriterStats,
};