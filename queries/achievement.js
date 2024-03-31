const { Achievement } = require('../models');
const logger = require('../utils/logger');

const getAchievement = async () => {
  try {
    const [achievement] = await Promise.all([
        Achievement.findOne({
          attributes: ['orderscompleted', 'satisfiedclients', 'positivefeedbacks', 'freebiesreleased'],
        }),
    ]);

    if (!achievement) {
      return next(new ErrorResponse(`Achievement not found`, 404));
    }

    return achievement;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

module.exports = {
    getAchievement,
};