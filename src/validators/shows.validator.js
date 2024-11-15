const Joi = require('joi');
const { validatorMiddleware } = require('../middlewares/validator.middleware');

const createValidation = [
  (req, res, next) => {
    const schema = Joi.object({
      movie_id: Joi.string()
        .uuid()
        .required()
        .message('Movie ID must be a valid UUID'),
      theater_id: Joi.string()
        .uuid()
        .required()
        .message('Theater ID must be a valid UUID'),
      show_time: Joi.string()
        .valid('Morning', 'Afternoon', 'Evening', 'Night')
        .required()
        .message('Invalid show time'),
      available_seats: Joi.number()
        .integer()
        .required()
        .message('Available seats should be an integer'),
      type: Joi.string()
        .valid('2D', '3D', '4D')
        .required()
        .message('Invalid type'),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    next();
  },

  validatorMiddleware,
];

const updateValidation = [
  (req, res, next) => {
    const schema = Joi.object({
      show_time: Joi.string()
        .valid('Morning', 'Afternoon', 'Evening', 'Night')
        .required()
        .message('Invalid show time'),
      available_seats: Joi.number()
        .integer()
        .required()
        .message('Invalid value for available seats'),
      type: Joi.string()
        .valid('2D', '3D', '4D')
        .required()
        .message('Invalid type'),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    next();
  },

  validatorMiddleware,
];

module.exports = {
  createValidation,
  updateValidation,
};
