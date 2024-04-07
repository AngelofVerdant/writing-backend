const { Level } = require('../models');
const { flattenToIdAndTitle: flattenPapers } = require("../helpers/paper");
const logger = require('../utils/logger');

const getLevelsWithPagination = async ({ sortOrder, filters, searchRegex, skip, limit }) => {
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
      whereClause.levelname = searchRegex;
    }

    const [totalCount, levels] = await Promise.all([
        Level.count({
          where: whereClause
        }),
        Level.findAll({
          attributes: ['level_id', 'levelname', 'leveldescription'],
          where: whereClause,
          order: [['levelname', sortOrder]],
          limit: limit,
          offset: skip,
          distinct: true,
        }),
    ]);

    return {
      totalCount: totalCount,
      count: levels.length,
      levels: levels.map(level => ({
        id: level.level_id,
        title: level.levelname,
      })),
    };
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getLevel = async ({ levelId = null }) => {
  try {
    if (levelId === null || isNaN(levelId)) {
      throw new Error('Level ID must be a valid number');
    }

    const [level] = await Promise.all([
        Level.findOne({
          attributes: ['level_id', 'levelname', 'leveldescription'],
          where: {
            level_id: levelId
          }
        }),
    ]);

    return level;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getLevelPapers = async ({ levelId = null }) => {
  try {
    if (levelId === null || isNaN(levelId)) {
      throw new Error('Level ID must be a valid number');
    }

    const [level] = await Promise.all([
        Level.findOne({
          attributes: ['level_id', 'levelname', 'leveldescription'],
          where: {
            level_id: levelId
          }
        }),
    ]);

    const [papers] = await Promise.all([
        level.getPapers({
          attributes: [
            'paper_id', 
            'papername'
          ],
          distinct: true,
        }),
    ]);

    const flattenedPapers = flattenPapers(papers);

    return {
      level: level,
      papers: flattenedPapers,
    };
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

module.exports = {
    getLevelsWithPagination,
    getLevel,
    getLevelPapers,
};