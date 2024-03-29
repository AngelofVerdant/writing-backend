const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const logger = require('./logger');

function restartServer(server) {
  if (cluster.isMaster) {
    logger.log('info', 'Restarting server...');
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  } else {
    server.close(() => {
      process.exit(1);
    });
  }
}

module.exports = restartServer;
