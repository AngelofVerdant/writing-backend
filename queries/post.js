const { Post } = require('../models');
const logger = require('../utils/logger');

const getPostsWithPagination = async ({ sortOrder, filters, searchRegex, skip, limit }) => {
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
      whereClause.postname = searchRegex;
    }

    const [totalCount, posts] = await Promise.all([
        Post.count({
          where: whereClause
        }),
        Post.findAll({
          attributes: ['post_id', 'postname', 'postdescription'],
          where: whereClause,
          order: [['postname', sortOrder]],
          limit: limit,
          offset: skip,
          distinct: true,
        }),
    ]);

    return {
      totalCount: totalCount,
      count: posts.length,
      posts: posts.map(post => ({
        id: post.post_id,
        title: post.postname,
      })),
    };
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getPost = async ({ postId = null }) => {
  try {
    if (postId === null || isNaN(postId)) {
      throw new Error('Post ID must be a valid number');
    }

    const [post] = await Promise.all([
        Post.findOne({
          attributes: ['post_id', 'postname', 'postdescription'],
          where: {
            post_id: postId
          }
        }),
    ]);

    return post;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

module.exports = {
    getPostsWithPagination,
    getPost,
};