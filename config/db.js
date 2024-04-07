const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
const db = require("../models");
const { getOptions } = require('./options');

const connectionStrings = {
  development: `postgres://${process.env.LOCAL_DATABASE_USERNAME}:${process.env.LOCAL_DATABASE_PASSWORD}@${process.env.LOCAL_DATABASE_HOST}:5432/${process.env.LOCAL_DATABASE_NAME}`,
  production: `postgres://${process.env.LIVE_DATABASE_USERNAME}:${process.env.LIVE_DATABASE_PASSWORD}@${process.env.LIVE_DATABASE_HOST}/${process.env.LIVE_DATABASE_NAME}`
};

const env = process.env.NODE_ENV || 'development';

const sequelizeOptions = getOptions(env);

const sequelize = new Sequelize(connectionStrings[env], sequelizeOptions);

const connectDB = async () => {
  try {
    await sequelize.authenticate();

    logger.log('info', 'Database Connected🎉');

    
    // if (env === 'development') {
    //   await db.sequelize.sync({ alter: true });
    //   logger.log('info', 'Database schema synchronized🚂');
    // } else {
    //   logger.log('info', 'Skipping database synchronization🎃');
    // }

    await db.sequelize.sync({ alter: true });
    logger.log('info', 'Get Ready, Get Ready😂😂😂');
    
  } catch (err) {
    logger.log('error', `Database Connection Error: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
};

module.exports = connectDB;