require("dotenv").config({ path: "./config.env" });

const express = require("express");
const app = express();
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const logger = require('./utils/logger');
const restartServer = require('./utils/restartServer');

connectDB();

// Cors
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Access-Control-Allow-Origin, Content-Type,Accept, Authorization, Origin, Accept, X-Requested-With,Access-Control-Request-Method, Access-Control-Request-Headers, x-access-token');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if ('OPTIONS' == req.method) {
      return res.sendStatus(200);
  } else {
      next();
  }
});

app.use(express.json());

// Use the requestLogger middleware for incoming requests
app.use(logger.requestLogger);

// testing to see if api is live
app.get("/api", (req, res, next) => {
  res.send("Software by Kifanga Mukundi");
});

// Connecting Routes
app.use("/api/auth", require("./routes/auth"));

app.use("/api/media", require("./routes/mediaManager"));

// new staff
app.use("/api/levels", require("./routes/level"));
app.use("/api/papers", require("./routes/paper"));
app.use("/api/paper-types", require("./routes/paperType"));
app.use("/api/orders", require("./routes/order"));
app.use("/api/users", require("./routes/user"));
app.use("/api/achievements", require("./routes/achievement"));


// Use the errorLogger middleware for errors
app.use(logger.errorLogger);

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  logger.log('info', `Sever running on port ${PORT}`)
);

// Handle server errors
server.on('error', (err) => {
  logger.log('error', `Server error: ${err}`);
  restartServer(server);
});

process.on('unhandledRejection', (err, promise) => {
  logger.log('error', `Unhandled Rejection: ${err.message}`, { stack: err.stack });
  // before i was using server.close(() => process.exit(1));
  restartServer();
});

process.on('uncaughtException', (err) => {
  logger.log('error', `Uncaught Exception: ${err.message}`, { stack: err.stack });
  // before i was using server.close(() => process.exit(1));
  restartServer();
});
