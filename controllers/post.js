const ErrorResponse = require("../utils/errorResponse");
const { Post, sequelize } = require('../models');
const { getPostsWithPagination, getPost } = require("../queries/post");

exports.create = async (req, res, next) => {
  try {
    const { 
      postname,
      postdescription,
    } = req.body;

    const post = await Post.create({
      postname,
      postdescription,
    });

    res.status(201).json({
      success: true,
      data: post,
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
        getPostsWithPagination({ sortOrder, filters, searchRegex, skip, limit }),
    ]);

    res.status(200).json({ success: true, message: "Success", data: result });
  } catch (err) {
    next(err);
  }
};

exports.updateById = async (req, res, next) => {
  let transaction;
  try {
      const { postId } = req.params;
      const { postname, postdescription } = req.body;

      transaction = await sequelize.transaction();

      const [post] = await Promise.all([
          Post.findOne({
            where: {
                post_id: postId,
            }
          }, { transaction }),
      ]);

      if (!post) {
        return next(new ErrorResponse(`Post not found with ID ${postId}`, 404));
      }

      await post.update({
        postname,
        postdescription
      }, { transaction });

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: post,
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
      const { postId } = req.params;

      transaction = await sequelize.transaction();

      const [post] = await Promise.all([
        getPost({ postId: postId }),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: post,
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
      const { postId } = req.params;

      transaction = await sequelize.transaction();

      const [post] = await Promise.all([
          Post.findOne({
            where: {
                post_id: postId,
            }
          }, { transaction }),
      ]);

      if (!post) {
        return next(new ErrorResponse(`Post not found with ID ${postId}`, 404));
      }

      await Post.destroy({
        where: { 
          post_id: postId
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

      const [posts] = await Promise.all([
          Post.findAll({
            attributes: [
              'post_id',
              'postname',
              'postdescription'
            ],
          }, { transaction }),
      ]);

      if (!posts) {
        return next(new ErrorResponse(`Posts not found`, 404));
      }

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: { posts: posts },
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};