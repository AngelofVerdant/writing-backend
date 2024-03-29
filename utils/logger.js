const fs = require('fs');
const path = require('path');

function customLogger(options = {}) {
  const { logLevel = 'info', logFilePath = 'logs/app.log', logToConsole = true } = options;

  const logLevels = {
    debug: 0,
    info: 1,
    warning: 2,
    error: 3,
  };

  const logFile = fs.createWriteStream(path.resolve(__dirname, logFilePath), { flags: 'a' });

  function log(level, message, meta) {
    if (logLevels[level] < logLevels[logLevel]) {
      return;
    }

    const logMessage = `${new Date().toISOString()} [${level.toUpperCase()}] ${message}`;
    if (meta) {
      logFile.write(`${logMessage} ${JSON.stringify(meta)}\n`);
      if (logToConsole) {
        console.log(logMessage, meta);
      }
    } else {
      logFile.write(`${logMessage}\n`);
      if (logToConsole) {
        console.log(logMessage);
      }
    }
  }

  function requestLogger(req, res, next) {
    const start = new Date();
    res.on('finish', () => {
      const end = new Date();
      const responseTime = end - start;
      const logMessage = `${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`;
      log('info', logMessage);
    });
    next();
  }

  function errorLogger(err, req, res, next) {
    const logMessage = `${err.stack}`;
    log('error', logMessage, { url: req.url, method: req.method, headers: req.headers });
    next(err);
  }

  function closeLogger() {
    logFile.end();
  }

  return {
    log,
    requestLogger,
    errorLogger,
    closeLogger,
  };
}

const logger = (() => {
  // Create an instance of the logger default level is info
  const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
  const instance = customLogger({ logLevel });

  return {
    log: instance.log,
    requestLogger: instance.requestLogger,
    errorLogger: instance.errorLogger,
    closeLogger: instance.closeLogger,
  };
})();

module.exports = logger;
