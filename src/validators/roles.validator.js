const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');

const createRole = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(51).required().messages({
      'string.max': 'Role name must be a string up to 51 characters',
      'any.required': 'Role name is required',
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

const updateRole = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(50).required().messages({
      'string.max': 'Role name must be a string up to 51 characters',
      'any.required': 'Role name is required',
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
  createRole,
  updateRole,
};
