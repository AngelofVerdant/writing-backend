const { Company, sequelize } = require('../models');
const { getCompany } = require("../queries/company");

exports.createOrUpdate = async (req, res, next) => {
  let transaction;
  try {
    const { companyname, companyemail, companyphone, companytwitterlink, companyfacebooklink, defaultimage, images } = req.body;

    transaction = await sequelize.transaction();

    const [achievement] = await Promise.all([
      Company.findOne({}, { transaction })
    ]);

    if (!achievement) {
      const record = await Company.createSingleton({
        companyname,
        companyemail,
        companyphone,
        companytwitterlink,
        companyfacebooklink,
        defaultimage,
        images,
      }, { transaction });

      await transaction.commit();

      res.status(201).json({
        success: true,
        data: record
      });
    } else {
      await achievement.update({
        companyname,
        companyemail,
        companyphone,
        companytwitterlink,
        companyfacebooklink,
        defaultimage,
        images
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
        getCompany(),
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