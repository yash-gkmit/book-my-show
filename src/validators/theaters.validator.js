const Joi = require('joi');

const createValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(50).required().messages({
      'string.max': 'Name must be a string with a maximum length of 50',
      'any.required': 'Name is required',
    }),
    address: Joi.string().required().messages({
      'any.required': 'Address is required',
    }),
    cityId: Joi.string().uuid().required().messages({
      'string.guid': 'City ID must be a valid UUID',
      'any.required': 'City ID is required',
    }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: 'Validation failed',
      details: error.details.map(detail => detail.message),
    });
  }

  next();
};

const updateValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(50).optional().messages({
      'string.max': 'Invalid name',
    }),
    address: Joi.string().optional().messages({
      'string.base': 'Invalid address',
    }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: 'Validation failed',
      details: error.details.map(detail => detail.message),
    });
  }

  next();
};

module.exports = {
  createValidation,
  updateValidation,
};
