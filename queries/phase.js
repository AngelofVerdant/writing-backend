const { Phase } = require('../models');
const logger = require('../utils/logger');

const getPhasesWithPagination = async ({ sortOrder, filters, searchRegex, skip, limit }) => {
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
      whereClause.phasename = searchRegex;
    }

    const [totalCount, phases] = await Promise.all([
        Phase.count({
          where: whereClause
        }),
        Phase.findAll({
          attributes: ['phase_id', 'phasename', 'phasedescription'],
          where: whereClause,
          order: [['phasename', sortOrder]],
          limit: limit,
          offset: skip,
          distinct: true,
        }),
    ]);

    return {
      totalCount: totalCount,
      count: phases.length,
      phases: phases.map(phase => ({
        id: phase.phase_id,
        title: phase.phasename,
      })),
    };
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getPhase = async ({ phaseId = null }) => {
  try {
    if (phaseId === null || isNaN(phaseId)) {
      throw new Error('Phase ID must be a valid number');
    }

    const [phase] = await Promise.all([
        Phase.findOne({
          attributes: ['phase_id', 'phasename', 'phasedescription'],
          where: {
            phase_id: phaseId
          }
        }),
    ]);

    if (!phase) {
      return next(new ErrorResponse(`Phase not found with ID ${phaseId}`, 404));
    }

    return phase;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

module.exports = {
    getPhasesWithPagination,
    getPhase,
};