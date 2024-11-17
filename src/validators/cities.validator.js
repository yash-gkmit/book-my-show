const Joi = require('joi');

const createCity = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(50).required().messages({
      'string.max': 'City name must be a string up to 50 characters',
      'any.required': 'City name is required',
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

const updateCity = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(50).required().messages({
      'string.max': 'City name must be a string up to 50 characters',
      'any.required': 'City name is required',
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
  createCity,
  updateCity,
};
