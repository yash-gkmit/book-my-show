const Joi = require('joi');

const createValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Movie name is required',
    }),
    summary: Joi.string().optional(),
    releaseDate: Joi.string().required().messages({
      'any.required': 'Release date is required',
    }),
    castMemberList: Joi.array().items(Joi.string()).required().messages({
      'any.required': 'Cast members must be provided',
      'array.base': 'Cast members must be an array',
    }),
    genre: Joi.string()
      .valid('Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance')
      .required()
      .messages({
        'any.required': 'Genre is required',
        'any.only':
          'Genre must be one of Action, Comedy, Drama, Horror, Sci-Fi, or Romance',
      }),
    language: Joi.string().required().messages({
      'any.required': 'Language is required',
    }),
    theaterIds: Joi.array()
      .items(Joi.string().uuid())
      .min(1)
      .required()
      .messages({
        'array.base': 'Theater IDs must be an array of UUIDs',
        'array.min': 'At least one theater ID is required',
        'string.guid': 'Each theater ID must be a valid UUID',
        'any.required': 'Theater IDs are required',
      }),
    category: Joi.string().messages({
      'string.max': 'City name must be a string up to 50 characters',
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

const updateValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().optional().messages({
      'string.base': 'Invalid name',
    }),
    summary: Joi.string().optional(),
    release_date: Joi.string().optional().allow(''),
    cast_member_list: Joi.array().items(Joi.string()).optional().messages({
      'array.base': 'Cast members must be an array',
    }),
    genre: Joi.string()
      .valid('Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance')
      .optional()
      .messages({
        'any.only':
          'Genre must be one of Action, Comedy, Drama, Horror, Sci-Fi, or Romance',
      }),
    language: Joi.string().optional().allow('').messages({
      'string.base': 'Invalid language',
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
  createValidation,
  updateValidation,
};
