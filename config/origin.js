const origins = require('../utils/origins');
const corsConfigs = {
    origin: (origin, callback) => {
        if (origins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Origin not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
};

module.exports = corsConfigs;