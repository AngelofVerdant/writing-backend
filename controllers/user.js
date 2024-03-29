const ErrorResponse = require("../utils/errorResponse");
const { User, sequelize } = require('../models');
const { flattenToIdAndTitle } = require("../helpers/user");
const { getUsersWithPagination, getUser } = require("../queries/user");

exports.getAllPaginate = async (req, res, next) => {
  try {
    const sortUser = req.sortUser;
    const filters = req.filterCriteria;
    const searchRegex = req.searchRegex;
    const { skip, limit } = req.pagination;

    const [result] = await Promise.all([
        getUsersWithPagination({ sortUser, filters, searchRegex, skip, limit }),
    ]);

    res.status(200).json({ success: true, message: "Success", data: result });
  } catch (err) {
    next(err);
  }
};

exports.updateById = async (req, res, next) => {
  let transaction;
  try {
      const { userId } = req.params;
      const { 
        isactive,
        islocked,
        isadmin,
        iscustomer,
        iswriter,
       } = req.body;

      transaction = await sequelize.transaction();

      const [user] = await Promise.all([
          User.findOne({
            where: {
                user_id: userId,
            }
          }, { transaction }),
      ]);

      if (!user) {
        return next(new ErrorResponse(`User not found with ID ${userId}`, 404));
      }

      await user.update({
        isactive,
        islocked,
        isadmin,
        iscustomer,
        iswriter,
      }, { transaction });

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: user,
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
      const { userId } = req.params;

      transaction = await sequelize.transaction();

      const [user] = await Promise.all([
        getUser({ userId: userId }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: user,
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

      const [users] = await Promise.all([
          User.findAll({
            attributes: [
              'user_id',
              'firstname',
              'lastname'
            ],
            group: ['user_id']
          }, { transaction }),
      ]);

      if (!users) {
        return next(new ErrorResponse(`Users not found`, 404));
      }

      const flattenedUsers = flattenToIdAndTitle(users);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: { users: flattenedUsers },
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};