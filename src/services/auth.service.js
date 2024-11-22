const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const {
  setOtpInRedis,
  getOtpFromRedis,
  deleteOtpFromRedis,
} = require('../helpers/redis.helper');

const { sendOtpEmail } = require('../helpers/mail.helper');
const { generateToken } = require('../helpers/jwt.helper');
const { throwCustomError } = require('../helpers/common.helper');

const { addTokenToBlacklist } = require('../helpers/redis.helper');

const register = async payload => {
  const { name, email, password, phone, roles } = payload;

  const hashedPassword = await bcrypt.hash(password, 10);

  const emailExist = User.findOne({
    where: { email: email },
  });

  if (emailExist) {
    throwCustomError('Email already exist!');
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

  return { userId: user.id };
};

const sendOtp = async email => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  console.log(otp);
  setOtpInRedis(email, otp);
  await sendOtpEmail(email, otp);

  return { message: 'OTP sent successfully' };
};

const verifyOtp = async (email, otp) => {
  const storedOtp = await getOtpFromRedis(email);
  console.log('Stored OTP:', storedOtp);

  if (!storedOtp) {
    throwCustomError('OTP expired or does not exist', 400);
  }

  if (storedOtp === otp) {
    const token = generateToken({ email });
    deleteOtpFromRedis(email);

    return { token: token };
  } else {
    throwCustomError('Invalid OTP', 400);
  }
};

const login = async payload => {
  const { email, role, password } = payload;

  const user = await User.findOne({
    where: { email },
    include: 'Roles',
  });

  if (!user) throwCustomError('User not found', 404);

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throwCustomError('Password is not correct', 401);
  }

  const userRoles = user.Roles.map(r => r.name);

  if (!userRoles.includes(role)) {
    throwCustomError(`Role not exist for that user`, 403);
  }

  const jwtContent = {
    user_id: user.id,
    roles: userRoles,
    selectedRole: role,
  };

  const token = jwt.sign(jwtContent, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });

  return { token, role: userRoles };
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
