const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const logger = require('../utils/logger');
const { User, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.register = async (req, res, next) => {
  let transaction;
  const { firstname, lastname, mobilenumber, email, password } = req.body;
  try {
    transaction = await sequelize.transaction();
    const user = await User.create({
      firstname,
      lastname,
      mobilenumber,
      email,
      password,
    }, { transaction });

    const { generatedToken, hashedToken, expirationDate } = user.getAccountActivationToken();

    user.accountActivationToken = hashedToken;
    user.accountActivationExpire = expirationDate;

    const activationUrl = process.env.NODE_ENV === 'production' ? `${process.env.LIVE_FRONT_END}/activate-account/${generatedToken}/${user.user_id}`
                                                                : `${process.env.LOCAL_FRONT_END}/activate-account/${generatedToken}/${user.user_id}`;

    const activationMessage = `
      <p>Dear <strong>${user.firstname} ${user.lastname}</strong>,</p>
      <p>Thank you for registering with our website! We're excited to have you as a new member of our community.</p>
      <p>To activate your account, please click the following link:</p>
      <a href=${activationUrl} clicktracking=off>${activationUrl}</a>
      <p>If the link above does not work, please copy and paste the URL below into your browser:</p>
      <a href=${activationUrl} clicktracking=off>${activationUrl}</a>
      <p>Once your account is activated, you'll be able to log in to our website and enjoy all the benefits of membership and our services.</p>
      <p>If you have any questions or concerns, please don't hesitate to reach out to our customer support team at <strong>${process.env.COMPANY_SUPPORT_EMAIL}</strong> or <strong>${process.env.COMPANY_SUPPORT_PHONE}</strong>.</p>
      <p>Thank you again for joining us. We look forward to connecting with you soon!</p>
      <p>Best regards,</p>
      <p><strong>${process.env.COMPANY_NAME}</strong></p>
    `;

    await Promise.all([
      sendEmail({
        to: user.email,
        subject: "Account Activation",
        html: activationMessage,
      }, process.env.NODE_ENV === 'production' ? 'accounts' : 'default'),
    ])
    .then(async () => {
      await transaction.commit();

      res.status(200).json({
        success: true,
        data: user,
      });
    })
    .catch(async (err) => {
      await transaction.rollback();

      logger.log('error', `${err.message}`, { stack: err.stack });
      next(new ErrorResponse("Registration email could not be sent", 500));
    });
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  try {
    const user = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email,
        },
      },
    });

    if (!user) {
      return next(new ErrorResponse('User Not Found', 401));
    }

    if (!user.isactive) {
      return next(new ErrorResponse('Account Inactive', 401));
    }

    if (user.islocked) {
      return next(new ErrorResponse('Account Locked', 401));
    }
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Incorrect Password', 401));
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.accountActivation = async (req, res, next) => {
  const { activationToken, id } = req.params;
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const [user] = await Promise.all([
      User.findByPk(id, { transaction }),
    ]);

    if (!user) {
      return next(new ErrorResponse(`User not found with ID ${id}`, 404));
    }

    const isValidToken = user.verifyActivationToken(activationToken);

    if (!isValidToken) {
      return next(new ErrorResponse('Invalid Account Activation Token', 400));
    }

    user.isactive = true;
    user.iscustomer = true;
    user.accountActivationToken = null;
    user.accountActivationExpire = null;

    await user.save({ transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      data: 'Account Activation Success',
    });
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const [user] = await Promise.all([
      User.findOne({
        where: {
          email
        }
      }, { transaction }),
    ]);

    if (!user) {
      return next(new ErrorResponse(`User not found with Email ${email}`, 404));
    }
  
    if (!user.isactive) {
      return next(new ErrorResponse("Account is inactive. Please activate your account.", 403));
    }

    if (user.islocked) {
      return next(new ErrorResponse("Account is locked. Please contact support for assistance.", 403));
    }

    if (user.lastResetRequestAt && user.resetRequestCount > 0) {
      const timeSinceLastRequest = Date.now() - new Date(user.lastResetRequestAt).getTime();

      if (timeSinceLastRequest < process.env.RESET_REQUEST_INTERVAL * 60 * 1000) {
        const timeRemaining = Math.ceil((process.env.RESET_REQUEST_INTERVAL * 60 * 1000 - timeSinceLastRequest) / 1000 / 60);
        return next(new ErrorResponse(`Password reset request is limited to one request every ${process.env.RESET_REQUEST_INTERVAL} minutes. Please wait for ${timeRemaining} minutes.`, 403));
      }
    }

    if (user.resetRequestCount >= 3) {
      user.islocked = true;
      await user.save({ transaction });

      return next(new ErrorResponse("Account has been locked. Please contact support for assistance.", 403));
    }

    const { generatedToken, hashedToken, expirationDate } = user.getResetPasswordToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = expirationDate;

    await user.save({ transaction });

    const resetUrl = process.env.NODE_ENV === 'production' ? `${process.env.LIVE_FRONT_END}/reset-password/${generatedToken}/${user.user_id}`
                                                            : `${process.env.LOCAL_FRONT_END}/reset-password/${generatedToken}/${user.user_id}`;

    const forgotMessage = `
      <p>Dear <strong>${user.firstname} ${user.lastname}</strong>,</p>

      <p>We have received a request to reset the password for your account. If you did not initiate this request, please disregard this email.</p>

      <p>To reset your password, please click on the following link <a href=${resetUrl} clicktracking=off>${resetUrl}</a> and follow the instructions provided. Please note that this link is valid for the next ${process.env.PASSWORD_RESET_EXPIRE} hours.</p>

      <p>If you are unable to click on the link above, please copy and paste the URL into your web browser.</p>

      <p>If you have any questions or concerns, please contact our customer support team at <strong>${process.env.COMPANY_SUPPORT_EMAIL}</strong> or <strong>${process.env.COMPANY_SUPPORT_PHONE}</strong>.</p>

      <p>Thank you,</p>
      <p><strong>${process.env.COMPANY_NAME}</strong></p>
    `;

    await Promise.all([
      sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html: forgotMessage,
      }, process.env.NODE_ENV === 'production' ? 'accounts' : 'default'),
    ])
    .then(async () => {
      await transaction.commit();

      res.status(200).json({
        success: true,
        data: user,
      });
    })
    .catch(async (err) => {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;

      await user.save({ transaction });

      await transaction.commit();

      logger.log('error', `${err.message}`, { stack: err.stack });
      next(new ErrorResponse("Reset email could not be sent", 500));
    });
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { resetToken, id } = req.params;
  const { password } = req.body;
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const [user] = await Promise.all([
      User.findByPk(id, { transaction }),
    ]);

    if (!user) {
      return next(new ErrorResponse(`User not found with ID ${id}`, 404));
    }

    if (!user.isactive) {
      return next(new ErrorResponse("Account is inactive. Please activate your account.", 403));
    }

    if (user.islocked) {
      return next(new ErrorResponse("Account is locked. Please contact support for assistance.", 403));
    }

    const isValidToken = user.verifyPasswordResetToken(resetToken);

    if (!isValidToken) {
      return next(new ErrorResponse('Invalid Password Reset Token', 400));
    }

    const resetMessage = `
    <p>Dear <strong>${user.firstname} ${user.lastname}</strong>,</p>

    <p>This is to inform you that your password has been changed as per your request or as a security measure for your account. We take the security and privacy of our users very seriously, and therefore, we have reset your password as a precautionary measure.</p>
    
    <p>If you did not request this change, please contact our support team immediately, and they will help you investigate the issue further. You can reach our support team at <strong>${process.env.COMPANY_SUPPORT_EMAIL}</strong> or <strong>${process.env.COMPANY_SUPPORT_PHONE}</strong>.</p>
    
    <p>If you have initiated the password change, you can now use your new password to log in to your account. Please ensure that you keep your password secure and do not share it with anyone.</p>
    
    <p>Thank you for using our services. If you have any further questions or concerns, please do not hesitate to contact us.</p>
    
    <p>Best regards,</p>
    <p><strong>${process.env.COMPANY_NAME}</strong></p>
    `;

    await Promise.all([
      sendEmail({
        to: user.email,
        subject: "Your Password Has Been Changed",
        html: resetMessage,
      }, process.env.NODE_ENV === 'production' ? 'accounts' : 'default'),
    ])
    .then(async () => {
      const hashedPassword = await user.hashPassword(password);

      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;

      user.resetRequestCount = 0;
      user.lastResetRequestAt = null;

      await user.save({transaction});

      await transaction.commit();

      res.status(200).json({
        success: true,
        data: user,
      });
    })
    .catch(async (err) => {
      await transaction.rollback();

      logger.log('error', `${err.message}`, { stack: err.stack });
      next(new ErrorResponse("Password reset confirmation email could not be sent", 500));
    });
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  const { refresh, id } = req.body;

  if (!refresh) {
    return next(new ErrorResponse('No refresh token passed', 400));
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (!user.isactive) {
      return next(new ErrorResponse("Account is inactive. Please activate your account.", 403));
    }

    if (user.islocked) {
      return next(new ErrorResponse("Account is locked. Please contact support for assistance.", 403));
    }

    const { decoded, isValid } = user.verifyRefreshToken(refresh);

    if (!isValid) {
      return next(new ErrorResponse('Invalid refresh token', 401));
    }

    sendRefreshToken(user, 200, refresh, res);
  } catch (err) {
    next(err);
  }
};

const sendToken = (user, statusCode, res) => {
  const acccess = user.getSignedJwtAccessToken();
  const refresh = user.getSignedJwtRefreshToken();
  res.status(statusCode).json({ sucess: true, user:{accessToken: acccess, refreshToken: refresh} });
};

const sendRefreshToken = (user, statusCode, originalRefreshToken, res) => {
  const acccess = user.getSignedJwtAccessToken();
  const refresh = originalRefreshToken;
  res.status(statusCode).json({ sucess: true, user:{accessToken: acccess, refreshToken: refresh} });
};