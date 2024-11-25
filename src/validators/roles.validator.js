const Joi = require('joi');

const createRole = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(51).required().messages({
      'string.max': 'Role name must be a string up to 51 characters',
      'any.required': 'Role name is required',
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

const updateRole = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(50).required().messages({
      'string.max': 'Role name must be a string up to 51 characters',
      'any.required': 'Role name is required',
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
  createRole,
  updateRole,
};
