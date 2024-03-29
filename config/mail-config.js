module.exports = {
    default: {
      host: 'localhost',
      port: 1025,
      from: 'admin@localhost.dev',
    },
    support: {
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL_USERNAME_SUPPORT,
        pass: process.env.ZOHO_EMAIL_PASSWORD_SUPPORT,
      },
      from: process.env.ZOHO_EMAIL_USERNAME_SUPPORT,
    },
    accounts: {
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL_USERNAME_ACCOUNTS,
        pass: process.env.ZOHO_EMAIL_PASSWORD_ACCOUNTS,
      },
      from: process.env.ZOHO_EMAIL_USERNAME_ACCOUNTS,
    },
  };
  