const Joi = require('joi');

const registerValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().message('Invalid email'),
    password: Joi.string()
      .min(6)
      .required()
      .message('Password must be at least 6 characters'),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  next();
};

const otpValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .message('OTP must be a 6-digit number'),
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
  registerValidation,
  otpValidation,
};
