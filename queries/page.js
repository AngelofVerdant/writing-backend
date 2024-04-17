const { Page } = require('../models');
const logger = require('../utils/logger');

const getPagesWithPagination = async ({ sortOrder, filters, searchRegex, skip, limit }) => {
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
      whereClause.pagename = searchRegex;
    }

    const [totalCount, pages] = await Promise.all([
        Page.count({
          where: whereClause
        }),
        Page.findAll({
          attributes: ['page_id', 'pagename', 'pagedescription'],
          where: whereClause,
          order: [['pagename', sortOrder]],
          limit: limit,
          offset: skip,
          distinct: true,
        }),
    ]);

    return {
      totalCount: totalCount,
      count: pages.length,
      pages: pages.map(page => ({
        id: page.page_id,
        title: page.pagename,
      })),
    };
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getPage = async ({ pageId = null }) => {
  try {
    if (pageId === null || isNaN(pageId)) {
      throw new Error('Page ID must be a valid number');
    }

    const [page] = await Promise.all([
        Page.findOne({
          attributes: ['page_id', 'pagename', 'pagedescription', 'pagelink'],
          where: {
            page_id: pageId
          }
        }),
    ]);
    
    return page;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getPageByLink = async ({ pageLink = null }) => {
  try {
    if (!pageLink) {
      throw new Error('Page link must be provided');
    }

    const page = await Page.findOne({
      attributes: ['page_id', 'pagename', 'pagedescription', 'pagelink'],
      where: {
        pagelink: pageLink
      }
    });

    if (!page) {
      throw new Error('Page not found');
    }

    return page;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};


module.exports = {
    getPagesWithPagination,
    getPage,
    getPageByLink,
};