const { Essay } = require('../models');
const logger = require('../utils/logger');

const getEssaysWithPagination = async ({ sortOrder, filters, searchRegex, skip, limit }) => {
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
      whereClause.essayname = searchRegex;
    }

    const [totalCount, essays] = await Promise.all([
        Essay.count({
          where: whereClause
        }),
        Essay.findAll({
          attributes: ['essay_id', 'essayname', 'essaydescription'],
          where: whereClause,
          order: [['essayname', sortOrder]],
          limit: limit,
          offset: skip,
          distinct: true,
        }),
    ]);

    return {
      totalCount: totalCount,
      count: essays.length,
      essays: essays.map(essay => ({
        id: essay.essay_id,
        title: essay.essayname,
      })),
    };
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getEssay = async ({ essayId = null }) => {
  try {
    if (essayId === null || isNaN(essayId)) {
      throw new Error('Essay ID must be a valid number');
    }

    const [essay] = await Promise.all([
        Essay.findOne({
          attributes: ['essay_id', 'essayname', 'essaydescription'],
          where: {
            essay_id: essayId
          }
        }),
    ]);

    return essay;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

module.exports = {
    getEssaysWithPagination,
    getEssay,
};