const authService = require('../services/auth.service');
const {
  errorHandler,
  throwCustomError,
  responseHandler,
} = require('../helpers/common.helper');

const register = async (req, res) => {
  try {
    const payload = req.body;

    const result = await authService.register(payload);

    res.message = 'user created successfully!';
    res.data = result;
    res.statusCode = 201;
    responseHandler(req, res);
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const sendOtp = async (req, res) => {
  const email = req.body;
  try {
    await authService.sendOtp(email);
    res.message = `otp send successfully to ${email}`;
    res.statusCode = 200;
    return responseHandler(req, res);
  } catch (error) {
    return errorHandler(req, res, error, error.statusCode || 400);
  }
};

const verifyOtp = async (req, res) => {
  const payload = {
    email: req.body.email,
    otp: req.body.otp,
  };
  try {
    const result = await authService.verifyOtp(payload);

    res.message = 'OTP verified successfully!';
    res.data = result;
    res.statusCode = 200;
    return responseHandler(req, res);
  } catch (error) {
    return errorHandler(req, res, error, error.statusCode || 400);
  }
};

const login = async (req, res) => {
  const payload = req.body;
  try {
    const result = await authService.login(payload);

    res.message = 'Login successful';
    res.data = result;
    res.statusCode = 200;
    return responseHandler(req, res);
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 401);
  }
};
const logout = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      throwCustomError('Token is required for logout', 401);
    }

    await authService.logout({ token });

    res.message = 'Successfully logged out';
    res.statusCode = 200;
    return responseHandler(req, res);
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

module.exports = {
  register,
  sendOtp,
  verifyOtp,
  login,
  logout,
};
