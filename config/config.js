module.exports = {
  development: {
    username: process.env.LOCAL_DATABASE_USERNAME,
    password: process.env.LOCAL_DATABASE_PASSWORD,
    database: process.env.LOCAL_DATABASE_NAME,
    host: process.env.LOCAL_DATABASE_HOST,
    dialect: process.env.DATABASE_DIALECT,
    logging: false,
    pool: {
      max: 10,
      min: 1,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: process.env.LIVE_DATABASE_USERNAME,
    password: process.env.LIVE_DATABASE_PASSWORD,
    database: process.env.LIVE_DATABASE_NAME,
    host: process.env.LIVE_DATABASE_HOST,
    dialect: process.env.DATABASE_DIALECT,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true
      }
    },
    logging: false,
    pool: {
      max: 10,
      min: 1,
      acquire: 30000,
      idle: 10000
    }
  },
};