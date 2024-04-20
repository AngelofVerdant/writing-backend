const ErrorResponse = require("../utils/errorResponse");
const { Paper, Level, sequelize } = require('../models');
const { flattenToIdAndTitle } = require("../helpers/paper");
const { getPapersWithPagination, getPaper, getPaperTypes } = require("../queries/paper");

exports.create = async (req, res, next) => {
  let transaction;
  try {
    const {
      papername,
      paperdescription,
      level_ids,
    } = req.body;

    transaction = await sequelize.transaction();

    const paper = await Paper.create(
      {
        papername,
        paperdescription,
      },
      { transaction }
    );

    if (level_ids && level_ids.length > 0) {
      const levels = await Level.findAll({
        where: {
          level_id: level_ids,
        },
        transaction,
      });

      await paper.addLevels(levels, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      data: paper,
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
        getPapersWithPagination({ sortOrder, filters, searchRegex, skip, limit }),
    ]);

    res.status(200).json({ success: true, message: "Success", data: result });
  } catch (err) {
    next(err);
  }
};

exports.updateById = async (req, res, next) => {
  let transaction;
  try {
    const { paperId } = req.params;
    const { papername, paperdescription, level_ids } = req.body;

    transaction = await sequelize.transaction();

    const [paper, levels] = await Promise.all([
      Paper.findOne({
        where: {
          paper_id: paperId,
        },
        include: [{ model: Level, as: 'Levels' }],
        transaction,
      }),
      Level.findAll({
        where: {
          level_id: level_ids,
        },
        transaction,
      }),
    ]);

    if (!paper) {
      return next(new ErrorResponse(`Paper not found with ID ${paperId}`, 404));
    }

    await paper.update(
      {
        papername,
        paperdescription,
      },
      { transaction }
    );

    await paper.removeLevels(paper.Levels, { transaction });

    await paper.addLevels(levels, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      data: paper,
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
      const { paperId } = req.params;

      transaction = await sequelize.transaction();

      const [paper] = await Promise.all([
        getPaper({ paperId: paperId }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: paper,
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
    const { paperId } = req.params;

    transaction = await sequelize.transaction();

    const paper = await Paper.findOne({
      where: {
        paper_id: paperId,
      },
      include: [{ model: Level, as: 'Levels' }],
      transaction,
    });

    if (!paper) {
      return next(new ErrorResponse(`Paper not found with ID ${paperId}`, 404));
    }

    await paper.removeLevels(paper.Levels, { transaction });

    await Paper.destroy({
      where: {
        paper_id: paperId,
      },
      transaction,
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

      const [papers] = await Promise.all([
          Paper.findAll({
            attributes: [
              'paper_id',
              'papername',
            ],
            group: ['paper_id']
          }, { transaction }),
      ]);

      if (!papers) {
        return next(new ErrorResponse(`Papers not found`, 404));
      }

      const flattenedPapers = flattenToIdAndTitle(papers);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: { papers: flattenedPapers },
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};

exports.getPaperTypes = async (req, res, next) => {
  let transaction;
  try {
      const { paperId } = req.params;

      transaction = await sequelize.transaction();

      const [papertypes] = await Promise.all([
        getPaperTypes({ paperId: paperId }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: papertypes,
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};