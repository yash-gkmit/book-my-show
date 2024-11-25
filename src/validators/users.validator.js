const Joi = require('joi');

const updateValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(50).optional().messages({
      'string.max': 'Name must be a string up to 50 characters',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Invalid email',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).optional().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
    phone: Joi.string()
      .pattern(/^\d{10}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Phone number must be between 10 digits',
        'any.required': 'Phone number is required',
      }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  next();
};

module.exports = {
  updateValidation,
};
