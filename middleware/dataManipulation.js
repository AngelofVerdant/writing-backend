const { Op } = require("sequelize");

exports.sortOrderMiddleware = function sortOrderMiddleware(validSortOrders, req, res, next) {
  const sortOrder = req.query?.sortOrder;
  req.sortOrder = validSortOrders.includes(sortOrder) && sortOrder === 'desc' ? 'desc' : 'asc';
  next();
};

exports.sortColumnMiddleware = function sortColumnMiddleware(validSortCriteria, defaultSortCriteria, req, res, next) {
  const sortByColumn = req.query.sortByColumn;
  req.sortByColumn = validSortCriteria.includes(sortByColumn) ? sortByColumn : defaultSortCriteria;
  next();
};

exports.filterMiddleware = function (req, res, next) {
  const filters = req.query?.filters;

  if (filters) {
    try {
      const filterCriteria = JSON.parse(filters);

      if (typeof filterCriteria === 'object' && !Array.isArray(filterCriteria)) {
        req.filterCriteria = filterCriteria;
      } else {
        return res.status(400).json({ error: 'Filter criteria must be a JSON object' });
      }
    } catch (err) {
      return res.status(400).json({ error: 'Invalid filter criteria' });
    }
  }

  next();
};
  
exports.searchMiddleware = function (req, res, next) {
  const search = req.query?.search;

  if (search && search.length >= 3) {
    req.searchRegex = {
      [Op.iLike]: `%${search}%`,
    };
  }

  next();
};

exports.paginationMiddleware = function(defaultPage = 1, defaultLimit = 2) {
  return function(req, res, next) {
    const page = parseInt(req.query.page) || defaultPage;
    const limit = parseInt(req.query.limit) || defaultLimit;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    req.pagination = {
      limit,
      skip: startIndex,
      page,
    };

    next();
  };
};