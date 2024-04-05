const ErrorResponse = require("../utils/errorResponse");
const fs = require('fs');
const util = require('util');
const unlinkAsync = util.promisify(fs.unlink);
const { Order, User, Level, Paper, PaperType, sequelize } = require('../models');
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST_LOCAL)
const { getOrdersWithPagination, getOrder, getWriterOrder, getAdminOrdersWithPagination, getWriterOrdersWithPagination, getCustomerStats, getWriterStats } = require("../queries/order");
const { downloadAllMedia } = require("../utils/common");

exports.create = async (req, res, next) => {
  let transaction;
  const user = req.user;
  try {
      const { 
          levelId,
          paperId,
          typeId,
          ordertitle,
          orderdescription,
          orderspace,
          orderdeadline,
          orderlanguage,
          orderformat,
          orderpages,
          ordersources,
          orderdefaultimage,
          orderimages
      } = req.body;

      transaction = await sequelize.transaction();

      const [level, paper, type] = await Promise.all([
          Level.findOne({
            where: {
                level_id: levelId,
            }
          }, { transaction }),
          Paper.findOne({
            where: {
                paper_id: paperId,
            }
          }, { transaction }),
          PaperType.findOne({
            where: {
                paper_type_id: typeId,
            }
          }, { transaction }),
      ]);

      if (!level || !paper || !type) {
        return next(new ErrorResponse(`Order  or Paper or Paper Type not found with ID ${levelId} or ${paperId} or ${typeId}`, 404));
      }

      const orderAmount = Math.round((parseFloat(type.priceperpage) * parseFloat(orderpages) + parseFloat(orderdeadline.price)) * 100) / 100;

      const order = await Order.create({
          ordertitle,
          orderdescription,
          orderspace,
          orderdeadline,
          orderlanguage,
          orderformat,
          orderpages,
          ordersources,
          orderdefaultimage,
          orderimages,
          orderstatus: { id: 1, title: 'Pending' },
          orderpaymentstatus: { id: 1, title: 'Unpaid' },
          orderprice: orderAmount,
          level_id: levelId,
          paper_id: paperId,
          paper_type_id: typeId,
          user_id: user.user_id,
      }, { transaction });

      await transaction.commit();

      res.status(201).json({
          success: true,
          data: order,
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};

exports.getAllPaginate = async (req, res, next) => {
const user = req.user;
  try {
    const sortOrder = req.sortOrder;
    const filters = req.filterCriteria;
    const searchRegex = req.searchRegex;
    const { skip, limit } = req.pagination;

    const [result] = await Promise.all([
        getOrdersWithPagination({ user_id: user.user_id, sortOrder, filters, searchRegex, skip, limit }),
    ]);

    res.status(200).json({ success: true, message: "Success", data: result });
  } catch (err) {
    next(err);
  }
};

exports.getAllAdminPaginate = async (req, res, next) => {
  try {
    const sortOrder = req.sortOrder;
    const filters = req.filterCriteria;
    const searchRegex = req.searchRegex;
    const { skip, limit } = req.pagination;

    const [result] = await Promise.all([
        getAdminOrdersWithPagination({ sortOrder, filters, searchRegex, skip, limit }),
    ]);

    res.status(200).json({ success: true, message: "Success", data: result });
  } catch (err) {
    next(err);
  }
};

exports.getAllWriterPaginate = async (req, res, next) => {
  const user = req.user;
  try {
    const sortOrder = req.sortOrder;
    const filters = req.filterCriteria;
    const searchRegex = req.searchRegex;
    const { skip, limit } = req.pagination;

    const [result] = await Promise.all([
        getWriterOrdersWithPagination({ user_id: user.user_id, sortOrder, filters, searchRegex, skip, limit }),
    ]);

    res.status(200).json({ success: true, message: "Success", data: result });
  } catch (err) {
    next(err);
  }
};

exports.updateById = async (req, res, next) => {
  let transaction;
  const user = req.user;
  try {
      const { orderId } = req.params;
      const { 
        orderdescription,
        orderdefaultimage,
        orderimages,
       } = req.body;

      transaction = await sequelize.transaction();

      const [order] = await Promise.all([
          Order.findOne({
            where: {
                order_id: orderId,
                user_id: user.user_id,
            }
          }, { transaction }),
      ]);

      if (!order) {
        return next(new ErrorResponse(`Order not found with ID ${orderId}`, 404));
      }

      await order.update({
        orderdescription,
        orderdefaultimage,
        orderimages,
      }, { transaction });

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: order,
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};

exports.pay = async (req, res, next) => {
  let transaction;
  const user = req.user;
  try {
    const { orderId, paymentId } = req.body;

    transaction = await sequelize.transaction();

    const order = await Order.findOne({
      where: {
        order_id: orderId,
        user_id: user.user_id,
      }
    }, { transaction });

    if (!order) {
      return next(new ErrorResponse(`Order not found with ID ${orderId}`, 404));
    }

    const amountInCents = order.orderprice * 100;

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "USD",
        description: order.title,
        payment_method: paymentId,
        return_url: "https://example.com/success",
        confirm: true,
        }, {
        idempotencyKey: `${orderId}-${paymentId}`
    });

    if (order.orderpaymentstatus.id === 2) {
        return next(new ErrorResponse(`Order is already paid for`, 400));
    }

    await order.update({
        orderpaymentstatus: { id: 2, title: 'Paid' },
    }, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    next(err);
  }
};

exports.assign = async (req, res, next) => {
  let transaction;
  try {
    const { orderId, userId } = req.body;

    transaction = await sequelize.transaction();

    const [order, user] = await Promise.all([
        Order.findOne({
          where: {
              order_id: orderId,
          }
        }),
        User.findOne({
          where: {
              user_id: userId,
          }
        }),
    ]);

    if (!order || !user) {
      return next(new ErrorResponse(`Order or User not found with ID ${orderAmount} or ${userId}`, 404));
    }

    if (order.orderpaymentstatus.id === 1) {
        return next(new ErrorResponse(`Order Has to be paid for before it can be assigned`, 400));
    }

    await order.update({
        writer_id: userId,
        orderstatus: { id: 2, title: 'In Progress' },
    }, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  let transaction;
  const user = req.user;
  try {
      const { orderId } = req.params;

      transaction = await sequelize.transaction();

      const [order] = await Promise.all([
        getOrder({ orderId: orderId, user_id: user.user_id }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: order,
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};

exports.downloadById = async (req, res, next) => {
  const user = req.user;
  let zipFileName;
  try {
    const { orderId } = req.params;

    const [order] = await Promise.all([
      getWriterOrder({ orderId: orderId, user_id: user.user_id }),
    ]);

    zipFileName = `order_${orderId}_images.zip`;

    const zipFilePath = await downloadAllMedia(order.orderimages, zipFileName);

    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const readStream = fs.createReadStream(zipFilePath);
    readStream.pipe(res);

    readStream.on('close', async () => {
      try {
        await unlinkAsync(zipFilePath);
        console.log(`Zip file '${zipFilePath}' deleted successfully.`);
      } catch (error) {
        console.error(`Error deleting zip file '${zipFilePath}':`, error);
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserStats = async (req, res, next) => {
  let transaction;
  const user = req.user;
  try {
      transaction = await sequelize.transaction();

      const [stats] = await Promise.all([
        getCustomerStats({ user_id: user.user_id, next }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: stats,
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};

exports.getWorkerStats = async (req, res, next) => {
  let transaction;
  const user = req.user;
  try {
      transaction = await sequelize.transaction();

      const [stats] = await Promise.all([
        getWriterStats({ writer_id: user.user_id, next }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: stats,
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};
