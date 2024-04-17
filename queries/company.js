const { Company } = require('../models');
const logger = require('../utils/logger');

const getCompany = async () => {
  try {
    const [company] = await Promise.all([
        Company.findOne({
          attributes: [
            'companyname', 
            'companyemail', 
            'companyphone', 
            'companytwitterlink', 
            'companyfacebooklink',
            'defaultimage',
            'images'
        ],
        }),
    ]);

    return company;
  } catch (err) {
    logger.log('error', `${err.message}`, { stack: err.stack });
    throw err;
  }
};

module.exports = {
    getCompany,
};