const ErrorResponse = require("../utils/errorResponse");
const { Essay, sequelize } = require('../models');
const { getEssaysWithPagination, getEssay } = require("../queries/essay");

exports.create = async (req, res, next) => {
  try {
    const { 
      essayname,
      essaydescription,
    } = req.body;

    const essay = await Essay.create({
      essayname,
      essaydescription,
    });

    res.status(201).json({
      success: true,
      data: essay,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllPaginate = async (req, res, next) => {
  try {
    const sortOrder = req.sortOrder;
    const filters = req.filterCriteria;
    const searchRegex = req.searchRegex;
    const { skip, limit } = req.pagination;

    const [result] = await Promise.all([
        getEssaysWithPagination({ sortOrder, filters, searchRegex, skip, limit }),
    ]);

    res.status(200).json({ success: true, message: "Success", data: result });
  } catch (err) {
    next(err);
  }
};

exports.updateById = async (req, res, next) => {
  let transaction;
  try {
      const { essayId } = req.params;
      const { essayname, essaydescription } = req.body;

      transaction = await sequelize.transaction();

      const [essay] = await Promise.all([
          Essay.findOne({
            where: {
                essay_id: essayId,
            }
          }, { transaction }),
      ]);

      if (!essay) {
        return next(new ErrorResponse(`Essay not found with ID ${essayId}`, 404));
      }

      await essay.update({
        essayname,
        essaydescription
      }, { transaction });

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: essay,
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
  try {
      const { essayId } = req.params;

      transaction = await sequelize.transaction();

      const [essay] = await Promise.all([
        getEssay({ essayId: essayId }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: essay,
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};

exports.deleteById = async (req, res, next) => {
  let transaction;
  try {
      const { essayId } = req.params;

      transaction = await sequelize.transaction();

      const [essay] = await Promise.all([
          Essay.findOne({
            where: {
                essay_id: essayId,
            }
          }, { transaction }),
      ]);

      if (!essay) {
        return next(new ErrorResponse(`Essay not found with ID ${essayId}`, 404));
      }

      await Essay.destroy({
        where: { 
          essay_id: essayId
         },
         transaction
      });

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: {},
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};

exports.getAll = async (req, res, next) => {
  let transaction;
  try {
      transaction = await sequelize.transaction();

      const [essays] = await Promise.all([
          Essay.findAll({
            attributes: [
              'essay_id',
              'essayname',
              'essaydescription'
            ],
            group: ['essay_id']
          }, { transaction }),
      ]);

      if (!essays) {
        return next(new ErrorResponse(`Essays not found`, 404));
      }

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: { essays: essays },
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};