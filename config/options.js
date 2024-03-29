const development = {
  dialect: process.env.DEV_DATABASE_DIALECT,
  logging: false,
  pool: {
    max: 10,
    min: 1,
    acquire: 30000,
    idle: 10000
  }
};

const production = {
  dialect: process.env.PROD_DATABASE_DIALECT,
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
    }
  },
  pool: {
    max: 10,
    min: 1,
    acquire: 30000,
    idle: 10000
  }
};

const getOptions = (env) => {
  if (env === 'production') {
    return production;
  }
  return development;
};

module.exports = {
    getOptions,
};