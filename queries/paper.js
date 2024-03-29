const { Paper } = require('../models');
const { flattenToIdAndTitle: flattenTypes } = require("../helpers/paperType");
const logger = require('../utils/logger');

const getPapersWithPagination = async ({ sortOrder, filters, searchRegex, skip, limit }) => {
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
      whereClause.papername = searchRegex;
    }

    const [totalCount, papers] = await Promise.all([
        Paper.count({
          where: whereClause
        }),
        Paper.findAll({
          attributes: ['paper_id', 'papername', 'paperdescription'],
          where: whereClause,
          order: [['papername', sortOrder]],
          limit: limit,
          offset: skip,
          distinct: true,
        }),
    ]);

    return {
      totalCount: totalCount,
      count: papers.length,
      papers: papers.map(paper => ({
        id: paper.paper_id,
        title: paper.papername,
      })),
    };
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getPaper = async ({ paperId = null }) => {
  try {
    if (paperId === null || isNaN(paperId)) {
      throw new Error('Paper ID must be a valid number');
    }

    const [paper] = await Promise.all([
        Paper.findOne({
          attributes: ['paper_id', 'papername', 'paperdescription', 'level_id'],
          where: {
            paper_id: paperId
          }
        }),
    ]);

    if (!paper) {
      return next(new ErrorResponse(`Paper not found with ID ${paperId}`, 404));
    }

    return paper;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getPaperTypes = async ({ paperId = null }) => {
  try {
    if (paperId === null || isNaN(paperId)) {
      throw new Error('Paper ID must be a valid number');
    }

    const [paper] = await Promise.all([
        Paper.findOne({
          attributes: ['paper_id', 'papername', 'paperdescription'],
          where: {
            paper_id: paperId
          }
        }),
    ]);

    if (!paper) {
      return next(new ErrorResponse(`Paper not found with ID ${paperId}`, 404));
    }

    const [papertypes] = await Promise.all([
        paper.getPaperTypes({
          attributes: [
            'paper_type_id', 
            'papertypename'
          ],
          distinct: true,
        }),
    ]);

    if (!papertypes) {
      return next(new ErrorResponse(`Paper types not found`, 404));
    }

    const flattenedTypes = flattenTypes(papertypes);

    return {
      paper: paper,
      papertypes: flattenedTypes,
    };
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

module.exports = {
    getPapersWithPagination,
    getPaper,
    getPaperTypes,
};