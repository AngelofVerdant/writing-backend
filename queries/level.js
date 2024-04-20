const { Level, Paper } = require('../models');
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
          attributes: ['level_id', 'levelname', 'leveldescription', 'priceperpage'],
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
        price: level.priceperpage,
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
          attributes: ['level_id', 'levelname', 'leveldescription', 'priceperpage'],
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

    const level = await Level.findOne({
      where: { level_id: levelId },
      include: [
        {
          model: Paper,
          as: 'LevelPapers',
          attributes: ['paper_id', 'papername'],
        },
      ],
    });

    if (!level) {
      throw new Error(`Level not found with ID ${levelId}`);
    }

    return {
      level: level,
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