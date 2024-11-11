const authService = require('../services/auth.service');
const {
  errorHandler,
  throwCustomError,
  responseHandler,
} = require('../helpers/common.helper');
const { validateRequest } = require('../helpers/validate.helper');

exports.register = async (req, res) => {
  try {
    const rules = {
      name: 'string',
      email: 'email',
      password: 'password',
      phone: 'phone',
      roles: 'array',
    };

    validateRequest(req.body, rules);

    const { name, email, password, phone, roles } = req.body;

    if (!Array.isArray(roles) || roles.length === 0) {
      throwCustomError(
        'Roles must be an array and at least one role must be provided',
        400,
      );
    }

    const result = await authService.register({
      name,
      email,
      password,
      phone,
      roles,
    });

    res.status(201).json({
      message: result.message,
      userId: result.userId,
    });
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

exports.sendOtp = async (req, res) => {
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

exports.verifyOtp = async (req, res) => {
  try {
    const rules = {
      email: 'email',
      otp: 'otp',
    };
    validateRequest(req.body, rules);

    await authService.verifyOtp(req.body.email, req.body.otp);
    res.data = { message: 'OTP verified successfully' };
    res.statusCode = 200;
    return responseHandler(req, res);
  } catch (error) {
    console.log(error);
    return errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

exports.login = async (req, res) => {
  try {
    console.log(req.body);

    const rules = {
      email: 'email',
      password: 'password',
    };
    validateRequest(req.body, rules);

    const { email, password, role } = req.body;
    console.log(`Email:: ${email}, Password: ${password}, Role:, ${role}`);

    const { token, roles } = await authService.login(email, password, role);

    res.status(200).json({
      message: 'Login successful',
      token,
      roles,
    });
  } catch (error) {
    console.error('Login error:', error);
    errorHandler(req, res, error.message, error.statusCode || 401);
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      throwCustomError('Token is required for logout', 401);
    }

    const result = await authService.logout(token);

    res.status(200).json({
      message: result.message || 'Successfully logged out',
    });
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};
