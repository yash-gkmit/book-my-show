const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpStore = new Map();
const { User, Role } = require('../models');

const { sendOtpEmail } = require('../helpers/mail.helper');
const { generateToken } = require('../helpers/jwt.helper');
const { throwCustomError } = require('../helpers/common.helper');

const { addTokenToBlacklist } = require('../helpers/redis.helper');

const register = async payload => {
  const { name, email, password, phone, roles = 'Customer' } = payload;

  const hashedPassword = await bcrypt.hash(password, 10);

  const emailExist = await User.findOne({
    where: { email: email },
  });

  if (emailExist) {
    throwCustomError('Email already exist!', 400);
  }

  const phoneExist = await User.findOne({
    where: { phone: phone },
  });

  if (phoneExist) {
    throwCustomError('Phone number already exist!', 400);
  }

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });

  if (!user) {
    throwCustomError('User creation failed', 400);
  }

  const userRoles = await Role.findAll({
    where: { name: roles },
  });

  if (userRoles.length > 0) {
    await user.setRoles(userRoles);
  } else {
    console.error(`Roles not found for names: ${roles}`);
  }
};

const sendOtp = async email => {
  const emailExist = await User.findOne({
    where: { email: email },
  });

  if (!emailExist) {
    throwCustomError('Email not exist.', 404);
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  console.log(otp);
  otpStore.set(email, otp);
  await sendOtpEmail(email, otp);
};

const verifyOtp = async (email, otp) => {
  const user = await User.findOne({
    where: { email: email },
  });
  console.log(user);

  const storedOtp = otpStore.get(email);
  console.log('Stored OTP:', storedOtp);

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

const logout = async token => {
  const decodedToken = jwt.decode(token);
  if (!decodedToken) {
    throwCustomError('Invalid token', 401);
  }

  const expiresIn = 300;

  return addTokenToBlacklist(token, expiresIn)
    .then()
    .catch(error => {
      console.log(error);
      throwCustomError('Logout failed', 400);
    });
};

module.exports = {
  register,
  sendOtp,
  verifyOtp,
  login,
  logout,
};
