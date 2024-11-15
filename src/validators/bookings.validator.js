const Joi = require('joi');
const { validatorMiddleware } = require('../middlewares/validator.middleware');

const createValidation = [
  (req, res, next) => {
    const schema = Joi.object({
      user_id: Joi.string().uuid().required().messages({
        'string.empty': 'User ID is required',
        'string.guid': 'User ID must be a valid UUID',
      }),
      show_id: Joi.string().uuid().required().messages({
        'string.empty': 'Show ID is required',
        'string.guid': 'Show ID must be a valid UUID',
      }),
      number_of_seat: Joi.number().integer().required().messages({
        'number.base': 'Number of seats must be a number',
        'number.integer': 'Number of seats must be an integer',
      }),
      booking_date: Joi.date().required().messages({
        'date.base': 'Booking date must be a valid date',
      }),
      booking_status: Joi.string()
        .valid('Confirmed', 'Pending', 'Canceled')
        .default('Pending')
        .messages({
          'any.only':
            'Booking status must be one of Confirmed, Pending, or Canceled',
        }),
      total_amount: Joi.number().integer().required().messages({
        'number.base': 'Total amount must be a number',
        'number.integer': 'Total amount must be an integer',
      }),
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
      user_id: Joi.string().uuid().optional().messages({
        'string.guid': 'User ID must be a valid UUID',
      }),
      show_id: Joi.string().uuid().optional().messages({
        'string.guid': 'Show ID must be a valid UUID',
      }),
      number_of_seat: Joi.number().integer().min(1).optional().messages({
        'number.base': 'Number of seats must be a number',
        'number.integer': 'Number of seats must be an integer',
        'number.min': 'Number of seats must be at least 1',
      }),
      booking_date: Joi.date().iso().optional().messages({
        'date.base': 'Booking date must be a valid date',
        'date.iso': 'Booking date must be in ISO format',
      }),
      booking_status: Joi.string()
        .valid('Confirmed', 'Pending', 'Canceled')
        .optional()
        .messages({
          'any.only':
            'Booking status must be one of Confirmed, Pending, or Canceled',
        }),
      total_amount: Joi.number().integer().min(1).optional().messages({
        'number.base': 'Total amount must be a number',
        'number.integer': 'Total amount must be an integer',
        'number.min': 'Total amount must be at least 1',
      }),
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

module.exports = { createValidation, updateValidation };
