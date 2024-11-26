const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpStore = new Map();
const { User, Role, sequelize } = require('../models');

const { sendOtpEmail } = require('../helpers/mail.helper');
const { generateToken } = require('../helpers/jwt.helper');
const { throwCustomError } = require('../helpers/common.helper');

const { addTokenToBlacklist } = require('../helpers/redis.helper');

const register = async payload => {
  const { name, email, password, phone, roles = ['Customer'] } = payload;

  const transaction = await sequelize.transaction();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userExist = await User.findOne(
      {
        where: { email: email },
        include: [
          {
            model: Role,
          },
        ],
      },
      { transaction },
    );

    if (userExist) {
      const userRoles = userExist?.Roles?.map(role => role.name);

      if (roles.every(role => userRoles.includes(role))) {
        throwCustomError('User with role already exist!', 400);
      }
    }

    let user = userExist;

    if (!userExist) {
      const phoneExist = await User.findOne(
        {
          where: { phone: phone },
        },
        { transaction },
      );

      if (phoneExist) {
        throwCustomError('Phone number already exist!', 400);
      }

      user = await User.create(
        {
          name,
          email,
          password: hashedPassword,
          phone,
        },
        { transaction },
      );
    }

    if (!user) {
      throwCustomError('User creation failed', 400);
    }

    const userRoles = await Role.findAll(
      {
        where: { name: roles },
      },
      { transaction },
    );

    if (userRoles.length > 0) {
      // Add roles to the user
      await user.addRoles(userRoles, { transaction });
    } else {
      console.error(`Roles not found for names: ${roles}`);
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const sendOtp = async payload => {
  const { email } = payload;

  const emailExist = await User.findOne({
    where: { email: email },
  });

  if (!emailExist) {
    throwCustomError('Email not exist.', 404);
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  console.log(otp);
  otpStore.set(email, otp);
  sendOtpEmail(email, otp);
};

const verifyOtp = async payload => {
  const { email, otp } = payload;

  const user = await User.findOne({
    where: { email: email },
  });

  const storedOtp = otpStore.get(email);

  if (!storedOtp) {
    throwCustomError('OTP expired or does not exist', 400);
  }

  if (storedOtp === otp) {
    const token = generateToken(user.id);
    otpStore.delete(email);

    return { token: token };
  } else {
    throwCustomError('Invalid OTP', 400);
  }
};

const login = async payload => {
  const { email, password } = payload;

  const user = await User.findOne({
    where: { email },
    include: 'Roles',
  });

  if (!user) throwCustomError('user not found', 404);

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throwCustomError('Password is not correct', 401);
  }

  const token = generateToken(user.id);

  return { token };
};

const logout = async payload => {
  const { token } = payload;
  const decodedToken = jwt.decode(token);
  if (!decodedToken) {
    throwCustomError('Invalid token', 401);
  }

  const expiresIn = 300;

  return addTokenToBlacklist(token, expiresIn);
};

module.exports = {
  register,
  sendOtp,
  verifyOtp,
  login,
  logout,
};
