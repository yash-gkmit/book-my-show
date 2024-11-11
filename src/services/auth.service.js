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

exports.register = async ({ name, email, password, phone, roles }) => {
  console.log('Register params:', { name, email, password, phone, roles });

  const hashedPassword = await bcrypt.hash(password, 10);

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

  return { message: 'User registered successfully', userId: user.id };
};

exports.sendOtp = async email => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  console.log(otp);
  setOtpInRedis(email, otp);
  await sendOtpEmail(email, otp);

  return { message: 'OTP sent successfully' };
};

exports.verifyOtp = async (email, otp) => {
  const storedOtp = await getOtpFromRedis(email);
  console.log('Stored OTP:', storedOtp);

  if (!storedOtp) {
    throwCustomError('OTP expired or does not exist', 400);
  }

  if (storedOtp === otp) {
    const token = generateToken({ email });
    console.log(`token: ${token}`);
    console.log({ message: 'OTP verify successful', token });
    deleteOtpFromRedis(email);

    return { message: 'OTP verified successfully', token };
  } else {
    throwCustomError('Invalid OTP', 400);
  }
};

exports.login = async (email, password, role) => {
  console.log(`Email: ${email}`);

  const user = await User.findOne({
    where: { email },
    include: 'Roles',
  });

  if (!user) throwCustomError('User not found', 404);

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throwCustomError('Invalid credentials', 401);

  const userRoles = user.Roles.map(r => r.name);

  if (!userRoles.includes(role)) {
    throwCustomError(`User does not have the ${role} role`, 403);
  }

  const payload = {
    user_id: user.id,
    roles: userRoles,
    selectedRole: role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return { message: 'Login successful', token, role };
};
