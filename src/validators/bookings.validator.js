const Joi = require('joi');
const { validatorMiddleware } = require('../middlewares/validator.middleware');
const commonHelper = require('../helpers/common.helper');

const createValidation = [
  (req, res, next) => {
    const schema = Joi.object({
      userId: Joi.string().uuid().messages({
        'string.guid': 'User ID must be a valid UUID',
      }),
      showId: Joi.string().uuid().required().messages({
        'string.empty': 'Show ID is required',
        'string.guid': 'Show ID must be a valid UUID',
      }),
      numberOfSeats: Joi.number().integer().required().messages({
        'number.base': 'Number of seats must be a number',
        'number.integer': 'Number of seats must be an integer',
      }),
      bookingDate: Joi.date().required().messages({
        'date.base': 'Booking date must be a valid date',
      }),
      booking_status: Joi.string()
        .valid('Confirmed', 'Pending', 'Canceled')
        .default('Pending')
        .messages({
          'any.only':
            'Booking status must be one of Confirmed, Pending, or Canceled',
        }),
      total_amount: Joi.number().integer().messages({
        'number.integer': 'Total amount must be an integer',
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
  },
  validatorMiddleware,
];

const updateValidation = [
  (req, res, next) => {
    const schema = Joi.object({
      userId: Joi.string().uuid().optional().messages({
        'string.guid': 'User ID must be a valid UUID',
      }),
      showId: Joi.string().uuid().optional().messages({
        'string.guid': 'Show ID must be a valid UUID',
      }),
      numberOfSeats: Joi.number().integer().optional().messages({
        'number.base': 'Number of seats must be a number',
        'number.integer': 'Number of seats must be an integer',
      }),
      bookingDate: Joi.date().optional().messages({
        'date.base': 'Booking date must be a valid date',
      }),
      bookingStatus: Joi.string()
        .valid('Confirmed', 'Pending', 'Canceled')
        .optional()
        .messages({
          'any.only':
            'Booking status must be one of Confirmed, Pending, or Canceled',
        }),
      total_amount: Joi.number().integer().optional().messages({
        'number.base': 'Total amount must be a number',
        'number.integer': 'Total amount must be an integer',
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
  },
  validatorMiddleware,
];

module.exports = { createValidation, updateValidation };
