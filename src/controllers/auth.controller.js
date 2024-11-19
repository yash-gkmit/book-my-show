const authService = require('../services/auth.service');
const {
  errorHandler,
  throwCustomError,
  responseHandler,
} = require('../helpers/common.helper');
const { validateRequest } = require('../helpers/validate.helper');

const register = async (req, res) => {
  try {
    const rules = {
      name: 'string',
      email: 'email',
      password: 'password',
      phone: 'phone',
      roles: 'array',
    };

    validateRequest(req.body, rules);

    const payload = req.body;

    if (!Array.isArray(payload.roles) || payload.roles.length === 0) {
      throwCustomError(
        'Roles must be an array and at least one role must be provided',
        400,
      );
    }

    const result = await authService.register(payload);

    res.data = {
      message: result.message,
      userId: result.userId,
    };
    res.statusCode = 201;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const sendOtp = async (req, res) => {
  try {
    validateRequest(req.body, { email: 'email' });

    await authService.sendOtp(req.body.email);
    res.data = { message: 'OTP sent successfully' };
    res.statusCode = 200;
    return responseHandler(req, res);
  } catch (error) {
    return errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const rules = {
      email: 'email',
      otp: 'otp',
    };
    validateRequest(req.body, rules);

    const { token } = await authService.verifyOtp(req.body.email, req.body.otp);

    res.data = { message: 'OTP verified successfully', Token: token };
    res.statusCode = 200;
    return responseHandler(req, res);
  } catch (error) {
    console.log(error);
    return errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const login = async (req, res) => {
  try {
    console.log(req.headers);
    const { email } = req.user;

    console.log(`Decoded Email: ${email}`);
    const { role } = req.body;

    const { token: newToken, roles } = await authService.login(email, role);

    res.data = { message: 'Login successful', token: newToken, roles };
    res.statusCode = 200;
    return responseHandler(req, res);
  } catch (error) {
    console.error('Login error:', error);
    errorHandler(req, res, error.message, error.statusCode || 401);
  }
};
const logout = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      throwCustomError('Token is required for logout', 401);
    }

    const result = await authService.logout(token);

    res.data = { message: 'Successfully logged out', result };
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
