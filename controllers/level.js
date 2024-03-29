const ErrorResponse = require("../utils/errorResponse");
const { Level, sequelize } = require('../models');
const { flattenToIdAndTitle } = require("../helpers/level");
const { getLevelsWithPagination, getLevel, getLevelPapers } = require("../queries/level");

exports.create = async (req, res, next) => {
  try {
    const { 
      levelname,
      leveldescription,
    } = req.body;

    const level = await Level.create({
      levelname,
      leveldescription,
    });

    res.status(201).json({
      success: true,
      data: level,
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
        getLevelsWithPagination({ sortOrder, filters, searchRegex, skip, limit }),
    ]);

    res.status(200).json({ success: true, message: "Success", data: result });
  } catch (err) {
    next(err);
  }
};

exports.updateById = async (req, res, next) => {
  let transaction;
  try {
      const { levelId } = req.params;
      const { levelname, leveldescription } = req.body;

      transaction = await sequelize.transaction();

      const [level] = await Promise.all([
          Level.findOne({
            where: {
                level_id: levelId,
            }
          }, { transaction }),
      ]);

      if (!level) {
        return next(new ErrorResponse(`Level not found with ID ${levelId}`, 404));
      }

      await level.update({
        levelname,
        leveldescription
      }, { transaction });

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: level,
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
      const { levelId } = req.params;

      transaction = await sequelize.transaction();

      const [level] = await Promise.all([
        getLevel({ levelId: levelId }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: level,
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
      const { levelId } = req.params;

      transaction = await sequelize.transaction();

      const [level] = await Promise.all([
          Level.findOne({
            where: {
                level_id: levelId,
            }
          }, { transaction }),
      ]);

      if (!level) {
        return next(new ErrorResponse(`Level not found with ID ${levelId}`, 404));
      }

      await Level.destroy({
        where: { 
          level_id: levelId
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

      const [levels] = await Promise.all([
          Level.findAll({
            attributes: [
              'level_id',
              'levelname',
            ],
            group: ['level_id']
          }, { transaction }),
      ]);

      if (!levels) {
        return next(new ErrorResponse(`Levels not found`, 404));
      }

      const flattenedLevels = flattenToIdAndTitle(levels);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: { levels: flattenedLevels },
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};

exports.getLevelPapers = async (req, res, next) => {
  let transaction;
  try {
      const { levelId } = req.params;

      transaction = await sequelize.transaction();

      const [level] = await Promise.all([
        getLevelPapers({ levelId: levelId }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: level,
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};