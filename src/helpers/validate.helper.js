const Joi = require('joi');
const { throwCustomError } = require('./common.helper');

const validateEmail = email => {
  const schema = Joi.string().email().required();
  const { error } = schema.validate(email);
  if (error) {
    throwCustomError('Invalid email format', 400);
  }
};

const validatePassword = password => {
  const schema = Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character',
    });
  const { error } = schema.validate(password);
  if (error) {
    throwCustomError(error.details[0].message, 400);
  }
};

const validateOtp = otp => {
  const schema = Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required();
  const { error } = schema.validate(otp);
  if (error) {
    throwCustomError('Invalid OTP format', 400);
  }
};

const validatePhone = phone => {
  const schema = Joi.string()
    .length(10)
    .pattern(/^\d{10}$/)
    .required();
  const { error } = schema.validate(phone);
  if (error) {
    throwCustomError('Invalid phone format', 400);
  }
};

const validateString = value => {
  const schema = Joi.string().min(1).required();
  const { error } = schema.validate(value);
  if (error) {
    throwCustomError('This field must be a valid string', 400);
  }
};

const validateArray = value => {
  const schema = Joi.array().min(1).required();
  const { error } = schema.validate(value);
  if (error) {
    throwCustomError('Roles must be a non-empty array', 400);
  }
};

const validateRequest = (data, rules) => {
  for (const field in rules) {
    const value = data[field];
    const rule = rules[field];

    switch (rule) {
      case 'email':
        this.validateEmail(value);
        break;
      case 'password':
        this.validatePassword(value);
        break;
      case 'otp':
        this.validateOtp(value);
        break;
      case 'phone':
        this.validatePhone(value);
        break;
      case 'array':
        this.validateArray(value);
        break;
      case 'string':
        this.validateString(value);
        break;
      default:
        throwCustomError(`Unknown validation rule for ${field}`, 400);
    }
  }
};

module.exports = {
  validateEmail,
  validateOtp,
  validateArray,
  validatePhone,
  validateString,
  validatePassword,
  validateRequest,
};
