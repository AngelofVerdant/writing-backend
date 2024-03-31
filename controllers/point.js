const ErrorResponse = require("../utils/errorResponse");
const { Point, sequelize } = require('../models');
const { getPointsWithPagination, getPoint } = require("../queries/point");

exports.create = async (req, res, next) => {
  try {
    const { 
      pointname,
      pointdescription,
    } = req.body;

    const point = await Point.create({
      pointname,
      pointdescription,
    });

    res.status(201).json({
      success: true,
      data: point,
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
        getPointsWithPagination({ sortOrder, filters, searchRegex, skip, limit }),
    ]);

    res.status(200).json({ success: true, message: "Success", data: result });
  } catch (err) {
    next(err);
  }
};

exports.updateById = async (req, res, next) => {
  let transaction;
  try {
      const { pointId } = req.params;
      const { pointname, pointdescription } = req.body;

      transaction = await sequelize.transaction();

      const [point] = await Promise.all([
          Point.findOne({
            where: {
                point_id: pointId,
            }
          }, { transaction }),
      ]);

      if (!point) {
        return next(new ErrorResponse(`Point not found with ID ${pointId}`, 404));
      }

      await point.update({
        pointname,
        pointdescription
      }, { transaction });

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: point,
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
      const { pointId } = req.params;

      transaction = await sequelize.transaction();

      const [point] = await Promise.all([
        getPoint({ pointId: pointId }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: point,
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
      const { pointId } = req.params;

      transaction = await sequelize.transaction();

      const [point] = await Promise.all([
          Point.findOne({
            where: {
                point_id: pointId,
            }
          }, { transaction }),
      ]);

      if (!point) {
        return next(new ErrorResponse(`Point not found with ID ${pointId}`, 404));
      }

      await Point.destroy({
        where: { 
          point_id: pointId
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

      const [points] = await Promise.all([
          Point.findAll({
            attributes: [
              'point_id',
              'pointname',
              'pointdescription'
            ],
          }, { transaction }),
      ]);

      if (!points) {
        return next(new ErrorResponse(`Points not found`, 404));
      }

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: { points: points },
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};