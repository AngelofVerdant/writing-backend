const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const { User } = require("../models");

const TOKEN_PREFIX = "Bearer";

const extractToken = (req) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith(TOKEN_PREFIX)) {
    token = req.headers.authorization.split(" ")[1];
  }

  return token;
};

const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    return decoded;
  } catch (err) {
    throw new ErrorResponse("Not authorized to access this resource", 401);
  }
};

exports.onlyLoggedIn = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new ErrorResponse("Not authorized to access this route", 401);
    }

    const decoded = await verifyToken(token);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new ErrorResponse("No user found with this id", 404);
    }

    if (!user.isactive) {
      throw new ErrorResponse("Your account is inactive: activate your account", 401);
    }

    if (user.islocked) {
      throw new ErrorResponse("Your account is locked: contact the admin", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

exports.onlyAdmin = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new ErrorResponse("Not authorized to access this route", 401);
    }

    const decoded = await verifyToken(token);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new ErrorResponse("No user found with this id", 404);
    }

    if (!user.isadmin) {
      throw new ErrorResponse("Only Admins Allowed", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};