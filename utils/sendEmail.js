const nodemailer = require('nodemailer');
const logger = require('./logger');
const mailConfig = require('../config/mail-config');

const sendEmail = (options, alias = '') => {
  const transporter = nodemailer.createTransport(mailConfig[alias]);

  const mailOptions = {
    from: mailConfig[alias].from,
    to: options.to,
    subject: options.subject,
    html: options.text,
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      logger.log('error', `${err.message}`, { stack: err.stack });
    } else {
      logger.log('info', `The information for sending the mail: ${info}`);
    }
  });
};

module.exports = sendEmail;

