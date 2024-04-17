const ErrorResponse = require("../utils/errorResponse");
const { Page, sequelize } = require('../models');
const { getPagesWithPagination, getPage, getPageByLink } = require("../queries/page");

exports.create = async (req, res, next) => {
  try {
    const { 
      pagename,
      pagedescription,
    } = req.body;

    const page = await Page.create({
      pagename,
      pagedescription,
    });

    res.status(201).json({
      success: true,
      data: page,
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
        getPagesWithPagination({ sortOrder, filters, searchRegex, skip, limit }),
    ]);

    res.status(200).json({ success: true, message: "Success", data: result });
  } catch (err) {
    next(err);
  }
};

exports.updateById = async (req, res, next) => {
  let transaction;
  try {
      const { pageId } = req.params;
      const { pagename, pagedescription } = req.body;

      transaction = await sequelize.transaction();

      const [page] = await Promise.all([
          Page.findOne({
            where: {
                page_id: pageId,
            }
          }, { transaction }),
      ]);

      if (!page) {
        return next(new ErrorResponse(`Page not found with ID ${pageId}`, 404));
      }

      await page.update({
        pagename,
        pagedescription
      }, { transaction });

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: page,
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
      const { pageId } = req.params;

      transaction = await sequelize.transaction();

      const [page] = await Promise.all([
        getPage({ pageId: pageId }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: page,
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};

exports.getByLink = async (req, res, next) => {
  let transaction;
  try {
      const { pageLink } = req.params;

      transaction = await sequelize.transaction();

      const [page] = await Promise.all([
        getPageByLink({ pageLink: pageLink }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: page,
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
      const { pageId } = req.params;

      transaction = await sequelize.transaction();

      const [page] = await Promise.all([
          Page.findOne({
            where: {
                page_id: pageId,
            }
          }, { transaction }),
      ]);

      if (!page) {
        return next(new ErrorResponse(`Page not found with ID ${pageId}`, 404));
      }

      await Page.destroy({
        where: { 
          page_id: pageId
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

      const [pages] = await Promise.all([
          Page.findAll({
            attributes: [
              'page_id',
              'pagename',
              'pagedescription',
              'pagelink'
            ],
          }, { transaction }),
      ]);

      if (!pages) {
        return next(new ErrorResponse(`Pages not found`, 404));
      }

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: { pages: pages },
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};