const { Point } = require('../models');
const logger = require('../utils/logger');

const getPointsWithPagination = async ({ sortOrder, filters, searchRegex, skip, limit }) => {
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
      whereClause.pointname = searchRegex;
    }

    const [totalCount, points] = await Promise.all([
        Point.count({
          where: whereClause
        }),
        Point.findAll({
          attributes: ['point_id', 'pointname', 'pointdescription'],
          where: whereClause,
          order: [['pointname', sortOrder]],
          limit: limit,
          offset: skip,
          distinct: true,
        }),
    ]);

    return {
      totalCount: totalCount,
      count: points.length,
      points: points.map(point => ({
        id: point.point_id,
        title: point.pointname,
      })),
    };
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getPoint = async ({ pointId = null }) => {
  try {
    if (pointId === null || isNaN(pointId)) {
      throw new Error('Point ID must be a valid number');
    }

    const [point] = await Promise.all([
        Point.findOne({
          attributes: ['point_id', 'pointname', 'pointdescription'],
          where: {
            point_id: pointId
          }
        }),
    ]);
    
    return point;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

module.exports = {
    getPointsWithPagination,
    getPoint,
};