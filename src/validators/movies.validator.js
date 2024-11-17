const Joi = require('joi');

const createValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().message('Movie name is required'),
    summary: Joi.string().optional(),
    release_date: Joi.string().required(),
    cast_member_list: Joi.array()
      .items(Joi.string())
      .required()
      .message('Cast members must be an array'),
    genre: Joi.string()
      .valid('Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance')
      .required(),
    language: Joi.string().required().message('Language is required'),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  next();
};

const updateValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().optional().message('Invalid name'),
    summary: Joi.string().optional(),
    release_date: Joi.string().optional().allow(''),
    cast_member_list: Joi.array()
      .items(Joi.string())
      .optional()
      .message('Cast members must be an array'),
    genre: Joi.string()
      .valid('Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance')
      .optional(),
    language: Joi.string().optional().allow('').message('Invalid Language'),
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
  createValidation,
  updateValidation,
};
