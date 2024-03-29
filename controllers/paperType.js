const ErrorResponse = require("../utils/errorResponse");
const { PaperType, Paper, sequelize } = require('../models');
const { getPaperTypesWithPagination, getPaperType } = require("../queries/paperType");

exports.create = async (req, res, next) => {
  let transaction;
  try {
      const { 
          papertypename,
          papertypedescription,
          priceperpage,
          paper_id,
      } = req.body;

      transaction = await sequelize.transaction();

      const [paper] = await Promise.all([
          Paper.findOne({
            where: {
                paper_id: paper_id,
            }
          }, { transaction }),
      ]);

      if (!paper) {
        return next(new ErrorResponse(`Paper not found with ID ${paper_id}`, 404));
      }

      const paperTypeAmount = Math.round((parseFloat(priceperpage)) * 100) / 100;

      const papertype = await PaperType.create({
          papertypename,
          papertypedescription,
          priceperpage: paperTypeAmount,
          paper_id,
      }, { transaction });

      await transaction.commit();

      res.status(201).json({
          success: true,
          data: papertype,
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
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
        getPaperTypesWithPagination({ sortOrder, filters, searchRegex, skip, limit }),
    ]);

    res.status(200).json({ success: true, message: "Success", data: result });
  } catch (err) {
    next(err);
  }
};

exports.updateById = async (req, res, next) => {
  let transaction;
  try {
      const { paperTypeId } = req.params;
      const { papertypename, papertypedescription, priceperpage, paper_id } = req.body;

      transaction = await sequelize.transaction();

      const [paperType, paper] = await Promise.all([
          PaperType.findOne({
            where: {
                paper_type_id: paperTypeId,
            }
          }, { transaction }),
          Paper.findOne({
            where: {
                paper_id: paper_id,
            }
          }, { transaction }),
      ]);

      if (!paperType || !paper) {
        return next(new ErrorResponse(`PaperType or Paper not found with ID ${paperTypeId} or ${paper_id}`, 404));
      }

      const paperTypeAmount = Math.round((parseFloat(priceperpage)) * 100) / 100;

      await paperType.update({
        papertypename,
        papertypedescription,
        priceperpage: paperTypeAmount,
        paper_id,
      }, { transaction });

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: paperType,
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
      const { paperTypeId } = req.params;

      transaction = await sequelize.transaction();

      const [paperType] = await Promise.all([
        getPaperType({ paperTypeId: paperTypeId }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: paperType,
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
      const { paperTypeId } = req.params;

      transaction = await sequelize.transaction();

      const [papertype] = await Promise.all([
          PaperType.findOne({
            where: {
                paper_type_id: paperTypeId,
            }
          }, { transaction }),
      ]);

      if (!papertype) {
        return next(new ErrorResponse(`PaperType not found with ID ${paperTypeId}`, 404));
      }

      await PaperType.destroy({
        where: { 
          paper_type_id: paperTypeId
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