const nodemailer = require('nodemailer');
const logger = require('./logger');
const mailConfig = require('../config/mail-config');

const sendEmail = (options, alias = '') => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport(mailConfig[alias]);

    const mailOptions = {
      from: mailConfig[alias].from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        logger.log('error', `${err.message}`, { stack: err.stack });
        reject(err);
      } else {
        logger.log('info', `Email sent successfully: ${info}`);
        resolve(info);
      }
    });
  });
};

module.exports = sendEmail;