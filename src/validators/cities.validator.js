const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');

const createCity = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(50).required().messages({
      'string.max': 'City name must be a string up to 50 characters',
      'any.required': 'City name is required',
    }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    commonHelper.errorHandler(
      req,
      res,
      `Validation failed: ${error.details[0].message}`,
      400,
    );
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
    commonHelper.errorHandler(
      req,
      res,
      `Validation failed: ${error.details[0].message}`,
      400,
    );
  }

  next();
};

module.exports = {
  createCity,
  updateCity,
};
