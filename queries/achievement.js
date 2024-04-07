const { Achievement } = require('../models');
const logger = require('../utils/logger');

const getAchievement = async () => {
  try {
    const [achievement] = await Promise.all([
        Achievement.findOne({
          attributes: ['orderscompleted', 'satisfiedclients', 'positivefeedbacks', 'freebiesreleased'],
        }),
    ]);

    return achievement;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

module.exports = {
    getAchievement,
};