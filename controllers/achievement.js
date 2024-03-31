const { Achievement, sequelize } = require('../models');
const { getAchievement } = require("../queries/achievement");

exports.createOrUpdate = async (req, res, next) => {
  let transaction;
  try {
    const { orderscompleted, satisfiedclients, positivefeedbacks, freebiesreleased } = req.body;

    transaction = await sequelize.transaction();

    const [achievement] = await Promise.all([
      Achievement.findOne({}, { transaction })
    ]);

    if (!achievement) {
      const record = await Achievement.createSingleton({
        orderscompleted,
        satisfiedclients,
        positivefeedbacks,
        freebiesreleased
      }, { transaction });

      await transaction.commit();

      res.status(201).json({
        success: true,
        data: record
      });
    } else {
      await achievement.update({
        orderscompleted,
        satisfiedclients,
        positivefeedbacks,
        freebiesreleased
      }, { transaction });

      await transaction.commit();

      res.status(200).json({
        success: true,
        data: achievement
      });
    }
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  let transaction;
  try {
      transaction = await sequelize.transaction();

      const [achievement] = await Promise.all([
        getAchievement(),
      ]);

      await transaction.commit();

      res.status(200).json({
          success: true,
          data: achievement,
      });
  } catch (err) {
      if (transaction) {
          await transaction.rollback();
      }
      next(err);
  }
};