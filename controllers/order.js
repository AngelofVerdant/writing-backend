const ErrorResponse = require("../utils/errorResponse");
const fs = require('fs');
const util = require('util');
const unlinkAsync = util.promisify(fs.unlink);
const { Order, User, Level, Paper, PaperType, sequelize } = require('../models');
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST_LOCAL)
const { getOrdersWithPagination, getOrder, getOrderByIdWriter, getWriterOrder, getUserOrder, getAdminOrdersWithPagination, getWriterOrdersWithPagination, getCustomerStats, getWriterStats } = require("../queries/order");
const { downloadAllDocuments } = require("../utils/common");
const { generateOrderPdf } = require('../utils/pdf');
const sendEmail = require("../utils/sendEmail");
const logger = require('../utils/logger');


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
          orderdefaultdocument,
          orderdocuments
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

      const order = {
          ordertitle,
          orderdescription,
          orderspace,
          orderdeadline,
          orderlanguage,
          orderformat,
          orderpages,
          ordersources,
          orderdefaultdocument,
          orderdocuments,
          orderstatus: { id: 1, title: 'Pending' },
          orderpaymentstatus: { id: 1, title: 'Unpaid' },
          orderprice: orderAmount,
          level_id: levelId,
          paper_id: paperId,
          paper_type_id: typeId,
          user_id: user.user_id,
      };

      const emailMessage = `
          <p>Dear ${user.firstname} ${user.lastname},</p>
          <p>Thank you for placing an order with us! We're thrilled to have the opportunity to assist you.</p>
          <p>We've successfully received your order details, and our team is ready to get started on your project. However, before we can begin working on it, we kindly request that you proceed with the payment.</p>
          <p>Here are the details of your order:</p>
          <ul>
            <li><strong>Order Title:</strong> ${ordertitle}</li>
            <li><strong>Deadline:</strong> ${orderdeadline.title}</li>
          </ul>
          <p>Total Amount: $ ${orderAmount}</p>
          <p>Once the payment is completed, we'll promptly start working on your project and keep you updated on its progress.</p>
          <p>If you have any questions or need further assistance, feel free to reach out to us. We're here to ensure a smooth and satisfactory experience for you.</p>
          <p>Thank you again for choosing our services. We're looking forward to working with you!</p>
          <p>Best regards,</p>
          <p><strong>${process.env.COMPANY_NAME}</strong></p>
      `;

      await sendEmail({
        to: user.email,
        subject: "Order Placement Confirmation",
        html: emailMessage,
      }, process.env.NODE_ENV === 'production' ? 'support' : 'default')
      .then(async () => {
        const createdOrder = await Order.create(order, { transaction });
        await transaction.commit();

        res.status(201).json({
          success: true,
          data: createdOrder,
        });
      })
      .catch(async (err) => {
        await transaction.rollback();
        logger.log('error', `${err.message}`, { stack: err.stack });
        next(new ErrorResponse("Order Placement Confirmation Email could not be sent", 500));
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
        orderdefaultdocument,
        orderdocuments,
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
        orderdefaultdocument,
        orderdocuments,
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

exports.submitById = async (req, res, next) => {
  let transaction;
  const user = req.user;
  try {
      const { orderId } = req.params;
      const { 
        orderdefaultuploaddocument,
        orderuploaddocuments,
       } = req.body;

      transaction = await sequelize.transaction();

      const [order] = await Promise.all([
          Order.findOne({
            where: {
                order_id: orderId,
                writer_id: user.user_id,
            }
          }, { transaction }),
      ]);

      if (!order) {
        return next(new ErrorResponse(`Order not found with ID ${orderId}`, 404));
      }

      if (!orderdefaultuploaddocument || !orderuploaddocuments || !orderuploaddocuments.length) {
        return next(new ErrorResponse('Default and additional documents are required', 400));
      }

      const [customer] = await Promise.all([
        User.findOne({
          where: {
            user_id: order.user_id,
          }
        }),
      ]);
  
      if (!customer) {
        return next(new ErrorResponse(`Customer not found`, 404));
      }

      const customerMessage = `
        <p>Dear ${customer.firstname} ${customer.lastname},</p>
        <p>We're pleased to inform you that the work on your writing project has been completed successfully!</p>
        <p>You can now log in to your account to access and download the final deliverable. Here are the details of your order:</p>
        <ul>
          <li><strong>Order Number:</strong> ${order.order_id}</li>
          <li><strong>Service Requested:</strong> ${order.ordertitle}</li>
          <li><strong>Deadline:</strong> ${order.orderdeadline.title}</li>
        </ul>
        <p>Simply visit our website and log in to your account to retrieve your completed work. If you have any questions or need assistance, please don't hesitate to contact us.</p>
        <p>Thank you for choosing our services. We hope you are satisfied with the outcome, and we look forward to serving you again in the future.</p>
        <p>Best regards,</p>
        <p><strong>${process.env.COMPANY_NAME}</strong></p>
    `;

    await Promise.all([
      sendEmail({
        to: customer.email,
        subject: "Order Completion Notification",
        html: customerMessage,
      }, process.env.NODE_ENV === 'production' ? 'support' : 'default'),
    ])
    .then(async () => {
      await order.update({
        orderdefaultuploaddocument,
        orderuploaddocuments,
        orderstatus: { id: 3, title: 'Completed' },
      }, { transaction });

      await transaction.commit();

      res.status(200).json({
        success: true,
        data: order,
      });
    })
    .catch(async (err) => {
      await transaction.rollback();
      logger.log('error', `${err.message}`, { stack: err.stack });
      next(new ErrorResponse("Order Completion emails could not be sent", 500));
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

    const [order, admin] = await Promise.all([
        Order.findOne({
          where: {
              order_id: orderId,
              user_id: user.user_id,
          }
        }, { transaction }),
        User.findOne({
          where: {
              isadmin: true,
          }
        }, { transaction }),
    ]);

    if (!order || !admin) {
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
    };

    const userMessage = `
      <p>Dear ${user.firstname} ${user.lastname},</p>
      <p>I hope this email finds you well.</p>
      <p>I'm writing to confirm that we've received your payment for the writing work order you recently placed with us. We appreciate your trust in our services and are eager to begin working on your project.</p>
      <p>Here are the details of your order:</p>
      <ul>
        <li><strong>Order Number:</strong> ${order.order_id}</li>
        <li><strong>Service Requested:</strong> ${order.ordertitle}</li>
        <li><strong>Payment Amount:</strong>$ ${order.orderprice}</li>
      </ul>
      <p>Our team will commence work on your project promptly. We aim to deliver high-quality results that meet your expectations within the agreed timeframe.</p>
      <p>Should you have any questions or require further assistance, please don't hesitate to reach out to us. We're here to ensure your satisfaction every step of the way.</p>
      <p>Thank you once again for choosing our services. We look forward to delivering exceptional results for you.</p>
      <p>Best regards,</p>
      <p><strong>${process.env.COMPANY_NAME}</strong></p>
    `;

    const adminMessage = `
      <p>Dear Admin,</p>
      <p>A new order has been placed and paid for. Here are the details:</p>
      <ul>
        <li><strong>Order Number:</strong> ${order.order_id}</li>
        <li><strong>Service Requested:</strong> ${order.ordertitle}</li>
        <li><strong>User:</strong> ${user.firstname} ${user.lastname}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Payment Amount:</strong>$ ${order.orderprice}</li>
      </ul>
      <p>Please assign a writer to this order as soon as possible.</p>
      <p>Best regards,</p>
      <p><strong>${process.env.COMPANY_NAME}</strong></p>
    `;

    await Promise.all([
      sendEmail({
        to: user.email,
        subject: "Confirmation of Payment and Order Details",
        html: userMessage,
      }, process.env.NODE_ENV === 'production' ? 'support' : 'default'),
      sendEmail({
        to: admin.email,
        subject: "New Paid Order Notification",
        html: adminMessage,
      }, process.env.NODE_ENV === 'production' ? 'support' : 'default')
    ])
    .then(async () => {
      await order.update({
        orderpaymentstatus: { id: 2, title: 'Paid' },
      }, { transaction });

      await transaction.commit();

      res.status(200).json({
        success: true,
        data: order,
      });
    })
    .catch(async (err) => {
      await transaction.rollback();
      logger.log('error', `${err.message}`, { stack: err.stack });
      next(new ErrorResponse("Payment confirmation emails could not be sent", 500));
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

    const order = await Order.findOne({
      where: {
        order_id: orderId,
      }
    });

    if (!order) {
      return next(new ErrorResponse(`Order not found with ID ${orderId}`, 404));
    }

    const [user, customer] = await Promise.all([
      User.findOne({
        where: {
          user_id: userId,
        }
      }),
      User.findOne({
        where: {
          user_id: order.user_id,
        }
      }),
    ]);

    if (!user || !customer) {
      return next(new ErrorResponse(`User or Customer not found`, 404));
    }

    if (order.orderpaymentstatus.id === 1) {
      return next(new ErrorResponse(`Order must be paid for before it can be assigned`, 400));
    }

    const customerMessage = `
      <p>Dear ${customer.firstname} ${customer.lastname},</p>
      <p>We're excited to inform you that work has started on your writing project. Our team is dedicated to delivering high-quality results that meet your expectations.</p>
      <p>Here are the details of your order:</p>
      <ul>
        <li><strong>Order Number:</strong> ${order.order_id}</li>
        <li><strong>Service Requested:</strong> ${order.ordertitle}</li>
        <li><strong>Deadline:</strong> ${order.orderdeadline.title}</li>
      </ul>
      <p>We'll keep you updated on the progress of your project and ensure that it is completed within the agreed timeframe. If you have any questions or concerns, please don't hesitate to reach out to us.</p>
      <p>Thank you for choosing our services. We're committed to delivering exceptional results for you.</p>
      <p>Best regards,</p>
      <p><strong>${process.env.COMPANY_NAME}</strong></p>
    `;

    const writerMessage = `
      <p>Dear ${user.firstname} ${user.lastname},</p>
      <p>You have been assigned to work on a writing project for one of our customers. We appreciate your dedication and commitment to delivering high-quality work.</p>
      <p>Here are the details of the assignment:</p>
      <ul>
        <li><strong>Customer Name:</strong> ${customer.firstname} ${customer.lastname}</li>
        <li><strong>Order Number:</strong> ${order.order_id}</li>
        <li><strong>Service Requested:</strong> ${order.ordertitle}</li>
        <li><strong>Deadline:</strong> ${order.orderdeadline.title}</li>
      </ul>
      <p>Please review the details carefully and begin working on the project at your earliest convenience. If you have any questions or need further clarification, feel free to reach out to us.</p>
      <p>We trust in your expertise and look forward to receiving outstanding results from you.</p>
      <p>Thank you for your cooperation!</p>
      <p>Best regards,</p>
      <p><strong>${process.env.COMPANY_NAME}</strong></p>
    `;

    await Promise.all([
      sendEmail({
        to: customer.email,
        subject: "Order Work Started Notification",
        html: customerMessage,
      }, process.env.NODE_ENV === 'production' ? 'support' : 'default'),
      sendEmail({
        to: user.email,
        subject: "Work Assignment Notification",
        html: writerMessage,
      }, process.env.NODE_ENV === 'production' ? 'support' : 'default')
    ]);

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

exports.getByIdWriter = async (req, res, next) => {
  let transaction;
  const user = req.user;
  try {
      const { orderId } = req.params;

      transaction = await sequelize.transaction();

      const [order] = await Promise.all([
        getOrderByIdWriter({ orderId: orderId, user_id: user.user_id }),
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

exports.downloadByIdWriter = async (req, res, next) => {
  const user = req.user;
  let zipFileName;
  let pdfFileName;
  try {
    const { orderId } = req.params;

    const [order] = await Promise.all([
      getWriterOrder({ orderId: orderId, user_id: user.user_id }),
    ]);

    zipFileName = `order_${orderId}_documents.zip`;

    const orderDetails = {
      orderId: order.order_id,
      orderTitle: order.ordertitle,
      orderDescription: order.orderdescription,
      orderLevel: order.Level.levelname,
      orderPaper: order.Paper.papername,
      orderPaperType: order.PaperType.papertypename,
      orderSpace: order.orderspace.title,
      orderDeadline: order.orderdeadline.title,
      orderLanguage: order.orderlanguage.title,
      orderFormat: order.orderformat.title,
      orderPages: order.orderpages,
      orderSources: order.ordersources,
    };

    pdfFileName = await generateOrderPdf(orderDetails);

    await new Promise((resolve, reject) => {
      const checkFile = setInterval(() => {
        fs.access(pdfFileName, fs.constants.F_OK, (err) => {
          if (!err) {
            clearInterval(checkFile);
            resolve();
          }
        });
      }, 1000);
    });

    const zipFilePath = await downloadAllDocuments(order.orderdocuments, zipFileName, pdfFileName);

    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const readStream = fs.createReadStream(zipFilePath);
    readStream.pipe(res);

    readStream.on('close', async () => {
      try {
        await unlinkAsync(zipFilePath);
        await unlinkAsync(pdfFileName);
        console.log(`Zip file '${zipFilePath}' deleted successfully.`);
      } catch (error) {
        console.error(`Error deleting zip file '${zipFilePath}':`, error);
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.downloadByIdUser = async (req, res, next) => {
  const user = req.user;
  let zipFileName;
  let pdfFileName;
  try {
    const { orderId } = req.params;

    const [order] = await Promise.all([
      getUserOrder({ orderId: orderId, user_id: user.user_id }),
    ]);

    zipFileName = `order_${orderId}_assignment.zip`;

    const orderDetails = {
      orderId: order.order_id,
      orderTitle: order.ordertitle,
      orderDescription: order.orderdescription,
      orderLevel: order.Level.levelname,
      orderPaper: order.Paper.papername,
      orderPaperType: order.PaperType.papertypename,
      orderSpace: order.orderspace.title,
      orderDeadline: order.orderdeadline.title,
      orderLanguage: order.orderlanguage.title,
      orderFormat: order.orderformat.title,
      orderPages: order.orderpages,
      orderSources: order.ordersources,
    };

    pdfFileName = await generateOrderPdf(orderDetails);

    await new Promise((resolve, reject) => {
      const checkFile = setInterval(() => {
        fs.access(pdfFileName, fs.constants.F_OK, (err) => {
          if (!err) {
            clearInterval(checkFile);
            resolve();
          }
        });
      }, 1000);
    });

    const zipFilePath = await downloadAllDocuments(order.orderuploaddocuments, zipFileName, pdfFileName);

    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const readStream = fs.createReadStream(zipFilePath);
    readStream.pipe(res);

    readStream.on('close', async () => {
      try {
        await unlinkAsync(zipFilePath);
        await unlinkAsync(pdfFileName);
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
        getCustomerStats({ user_id: user.user_id }),
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
        getWriterStats({ writer_id: user.user_id }),
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