const { ValidationError } = require('sequelize');
const ErrorResponse = require("../utils/errorResponse");
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Handle Sequelize validation errors
  if (err instanceof ValidationError) {
    const messages = err.errors.map(error => error.message);
    error = new ErrorResponse(messages, 400);
  }

  // // Sequelize validation error (more specific)
  // if (err.name === 'SequelizeValidationError') {
  //   const message = err.errors.map(error => error.message);
  //   error = new ErrorResponse([message], 400);
  // }

  // Sequelize unique constraint violation (duplicate key)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse([message], 400);
  }


  // Sequelize cast error
  if (err.name === 'SequelizeDatabaseError' && err.original.code === '22P02') {
    const message = `Invalid ${err.original.column}: ${err.message}`;
    error = new ErrorResponse([message], 400);
  }

  // Sequelize connection error
  if (err.name === 'SequelizeConnectionRefusedError') {
    const message = 'Unable to connect to the database';
    error = new ErrorResponse([message], 500);
  }

  // Network related error handling
  if (err.code === "ENOTFOUND") {
    const message = "Unable to connect to the server. Please check your internet connection and try again.";
    error = new ErrorResponse([message], 500);
  }

  if (err.code === "ETIMEDOUT") {
    const message = "The request has timed out. Please try again later.";
    error = new ErrorResponse([message], 408);
  }

  if (err.code === "ECONNREFUSED") {
    const message = "The connection to the server was refused. Please try again later.";
    error = new ErrorResponse([message], 503);
  }

  if (err.code === "ECONNRESET") {
    const message = "The connection to the server was reset unexpectedly. Please try again later.";
    error = new ErrorResponse([message], 500);
  }
  if (err.code === "EAI_AGAIN") {
    const message = "DNS lookup failed. Please check your network connection and try again.";
    error = new ErrorResponse([message], 500);
  }
  
  // file upload error handling
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large';
    error = new ErrorResponse([message], 400);
  }

  if (err.code === 'filetype') {
    const message = 'File type not allowed';
    error = new ErrorResponse([message], 400);
  }

  if (err.code === 'ENOENT') {
    const message = 'File not found';
    error = new ErrorResponse([message], 404);
  }

  // handle all the javascript errors
  if (err instanceof TypeError) {
    const message = "Invalid operation. Please check the data types and try again.";
    error = new ErrorResponse([message], 400);
  }

  if (err instanceof RangeError) {
    const message = "Value out of range. Please enter a valid value and try again.";
    error = new ErrorResponse([message], 400);
  }

  // if (err instanceof ReferenceError) {
  //   const message = "Reference error. Please check your code and try again.";
  //   error = new ErrorResponse([message], 500);
  // }

  if (err instanceof SyntaxError) {
    const message = "Syntax error. Please check your code and try again.";
    error = new ErrorResponse([message], 500);
  }

  if (err instanceof EvalError) {
    const message = "Error occurred during evaluation. Please check your code and try again.";
    error = new ErrorResponse([message], 500);
  }

  logger.log('error', `${error.message}`, { stack: error.stack });

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;