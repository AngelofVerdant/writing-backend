const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'First Name is Required',
          },
          len: {
            args: [3,],
            msg: 'First Name must have at least 3 characters',
          },
        },
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Last Name is Required',
          },
          len: {
            args: [3,],
            msg: 'Last Name must have at least 3 characters',
          },
        },
      },      
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            args: true,
            msg: "Provide a valid email address"
          },
          notEmpty: {
            msg: 'Email is required',
          },
        },
      },
      mobilenumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isKenyanMobileNumber(value) {
            const kenyanMobileNumberRegex = /^(\+254|0)\d{9}$/;
            if (!kenyanMobileNumberRegex.test(value)) {
              throw new Error('Invalid Kenyan mobile number format');
            }
          },
        },
      },      
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [8,],
            msg: 'Password must be at least 8 characters long',
          },
          notEmpty: {
            msg: 'Password is required',
          },
        },
      },      
      isactive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      islocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isadmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      iscustomer: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      iswriter: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      accountActivationToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accountActivationExpire: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpire: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      resetRequestCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: {
            args: [0],
            msg: 'Reset request count must be greater than or equal to 0',
          },
          max: {
            args: [5],
            msg: 'Reset request count must be less than or equal to 5',
          },
        },
      },
      lastResetRequestAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      modelName: 'User',
      freezeTableName: true,
      timestamps: false,
      hooks: {
        beforeCreate: async (user, options) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );
  
  // Associations
  User.associate = (models) => {

    User.hasMany(models.Order, {
      foreignKey: 'user_id',
      as: 'Orders',
    });

  };

  // Methods
  User.prototype.getAccountActivationToken = function () {
    const generatedToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(generatedToken)
      .digest("hex");
    
    const expirationDate = Date.now() + process.env.ACCOUNT_ACTIVATION_EXPIRE * 60 * 60 * 1000;

    this.accountActivationToken = hashedToken;
    this.accountActivationExpire = new Date(expirationDate);

    return { generatedToken, hashedToken, expirationDate };
  }

  User.prototype.verifyActivationToken = function (candidateToken) {
    const hashedCandidateToken = crypto
      .createHash('sha256')
      .update(candidateToken)
      .digest('hex');

    const isTokenValid =
      hashedCandidateToken === this.accountActivationToken &&
      this.accountActivationExpire > Date.now();

    return isTokenValid;
  }

  User.prototype.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.getResetPasswordToken = function () {
    const generatedToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(generatedToken).digest('hex');

    const expirationDate = Date.now() + process.env.PASSWORD_RESET_EXPIRE * 60 * 60 * 1000;

    this.resetRequestCount += 1;
    this.lastResetRequestAt = new Date();

    this.resetPasswordToken = hashedToken;
    this.resetPasswordExpire = new Date(expirationDate);

    return {
      generatedToken,
      hashedToken,
      expirationDate,
    };
  }

  User.prototype.verifyPasswordResetToken = function (candidateToken) {
    const hashedCandidateToken = crypto
      .createHash('sha256')
      .update(candidateToken)
      .digest('hex');

    const isTokenValid =
      hashedCandidateToken === this.resetPasswordToken &&
      this.resetPasswordExpire > Date.now();

    return isTokenValid;
  }

  User.prototype.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  User.prototype.verifyRefreshToken = function (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
      return { decoded, isValid: true };
    } catch (error) {
      return { decoded: null, isValid: false };
    }
  }

  User.prototype.getSignedJwtAccessToken = function () {
    return jwt.sign(
      {
        id: this.user_id,
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email,
        mobilenumber: this.mobilenumber,
        isadmin: this.isadmin,
        iswriter: this.iswriter,
        iscustomer: this.iscustomer,
      },
      process.env.ACCESS_SECRET,
      {
        expiresIn: process.env.ACCESS_EXPIRE,
      }
    );
  };

  User.prototype.getSignedJwtRefreshToken = function () {
    return jwt.sign(
      { id: this.user_id, email: this.email },
      process.env.REFRESH_SECRET,
      {
        expiresIn: process.env.REFRESH_EXPIRE,
      }
    );
  };

  return User;
};