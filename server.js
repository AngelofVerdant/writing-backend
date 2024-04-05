require("dotenv").config({ path: "./config.env" });

const express = require("express");
const app = express();
const cors = require('cors');
const connectDB = require("./config/db");
const corsConfigs = require('./config/origin');
const errorHandler = require("./middleware/error");
const logger = require('./utils/logger');
const restartServer = require('./utils/restartServer');

connectDB();

// Cors
app.use(cors(corsConfigs));

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
app.use("/api/documents", require("./routes/documentManager"));

// new staff
app.use("/api/levels", require("./routes/level"));
app.use("/api/papers", require("./routes/paper"));
app.use("/api/paper-types", require("./routes/paperType"));
app.use("/api/orders", require("./routes/order"));
app.use("/api/users", require("./routes/user"));
app.use("/api/achievements", require("./routes/achievement"));
app.use("/api/points", require("./routes/point"));
app.use("/api/essays", require("./routes/essay"));
app.use("/api/phases", require("./routes/phase"));
app.use("/api/posts", require("./routes/post"));


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