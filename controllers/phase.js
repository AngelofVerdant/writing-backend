const ErrorResponse = require("../utils/errorResponse");
const { Phase, sequelize } = require('../models');
const { getPhasesWithPagination, getPhase } = require("../queries/phase");

exports.create = async (req, res, next) => {
  try {
    const { 
      phasename,
      phasedescription,
    } = req.body;

    const phase = await Phase.create({
      phasename,
      phasedescription,
    });

    res.status(201).json({
      success: true,
      data: phase,
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
        getPhasesWithPagination({ sortOrder, filters, searchRegex, skip, limit }),
    ]);

    res.status(200).json({ success: true, message: "Success", data: result });
  } catch (err) {
    next(err);
  }
};

exports.updateById = async (req, res, next) => {
  let transaction;
  try {
      const { phaseId } = req.params;
      const { phasename, phasedescription } = req.body;

      transaction = await sequelize.transaction();

      const [phase] = await Promise.all([
          Phase.findOne({
            where: {
                phase_id: phaseId,
            }
          }, { transaction }),
      ]);

      if (!phase) {
        return next(new ErrorResponse(`Phase not found with ID ${phaseId}`, 404));
      }

      await phase.update({
        phasename,
        phasedescription
      }, { transaction });

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: phase,
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
      const { phaseId } = req.params;

      transaction = await sequelize.transaction();

      const [phase] = await Promise.all([
        getPhase({ phaseId: phaseId }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: phase,
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
      const { phaseId } = req.params;

      transaction = await sequelize.transaction();

      const [phase] = await Promise.all([
          Phase.findOne({
            where: {
                phase_id: phaseId,
            }
          }, { transaction }),
      ]);

      if (!phase) {
        return next(new ErrorResponse(`Phase not found with ID ${phaseId}`, 404));
      }

      await Phase.destroy({
        where: { 
          phase_id: phaseId
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

      const [phases] = await Promise.all([
          Phase.findAll({
            attributes: [
              'phase_id',
              'phasename',
              'phasedescription'
            ],
            group: ['phase_id']
          }, { transaction }),
      ]);

      if (!phases) {
        return next(new ErrorResponse(`Phases not found`, 404));
      }

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: { phases: phases },
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};