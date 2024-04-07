const { User } = require('../models');
const logger = require('../utils/logger');

const getUsersWithPagination = async ({ sortUser, filters, searchRegex, skip, limit }) => {
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
      whereClause.firstname = searchRegex;
    }

    const [totalCount, users] = await Promise.all([
        User.count({
          where: whereClause
        }),
        User.findAll({
          attributes: [
            'user_id', 
            'firstname', 
            'lastname',
        ],
          where: whereClause,
          user: [['user_id', sortUser]],
          limit: limit,
          offset: skip,
          distinct: true,
        }),
    ]);

    return {
      totalCount: totalCount,
      count: users.length,
      users: users.map(user => ({
        id: user.user_id,
        title: `${user.firstname} ${user.lastname}`,
      })),
    };
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

const getUser = async ({ userId = null }) => {
  try {
    if (userId === null || isNaN(userId)) {
      throw new Error('User ID must be a valid number');
    }

    const [user] = await Promise.all([
        User.findOne({
          attributes: [
            'user_id', 
            'firstname', 
            'lastname',
            'email',
            'isactive',
            'islocked',
            'isadmin',
            'iswriter',
            'iscustomer',
        ],
          where: {
            user_id: userId,
          }
        }),
    ]);

    return user;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

module.exports = {
    getUsersWithPagination,
    getUser,
};