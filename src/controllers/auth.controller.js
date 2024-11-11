const authService = require('../services/auth.service');
const { errorHandler, throwCustomError } = require('../helpers/common.helper');
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
