const Joi = require('joi');

const createValidation = (req, res, next) => {
  const schema = Joi.object({
    movieId: Joi.string().uuid().required().messages({
      'string.uuid': '"Movie ID" must be a valid UUID',
      'any.required': '"Movie ID" is required',
    }),
    theaterId: Joi.string().uuid().required().messages({
      'string.uuid': '"Theater ID" must be a valid UUID',
      'any.required': '"Theater ID" is required',
    }),
    showTime: Joi.date().required().messages({
      'date.base': '"Show time" must be a valid date',
      'any.required': '"Show time" is required',
    }),
    availableSeats: Joi.number().integer().required().messages({
      'number.base': '"Available seats" should be a valid number',
      'number.integer': '"Available seats" should be an integer',
      'any.required': '"Available seats" is required',
    }),
    type: Joi.string().valid('2D', '3D', '4D').required().messages({
      'any.only': '"Type" must be one of: 2D, 3D, or 4D',
      'any.required': '"Type" is required',
    }),
    price: Joi.number().integer().required().messages({
      'number.base': '"Price" should be a valid number',
      'number.integer': '"Price" should be an integer',
      'any.required': '"Price" is required',
    }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: `Validation failed: ${error.details[0].message}`,
    });
  }

  next();
};

const updateValidation = (req, res, next) => {
  const schema = Joi.object({
    showTime: Joi.string()
      .valid('Morning', 'Afternoon', 'Evening', 'Night')
      .messages({
        'any.only':
          '"Show time" must be one of: Morning, Afternoon, Evening, or Night',
        'any.required': '"Show time" is required',
      }),
    availableSeats: Joi.number().integer().messages({
      'number.base': '"Available seats" should be a valid number',
      'number.integer': '"Available seats" should be an integer',
      'any.required': '"Available seats" is required',
    }),
    type: Joi.string().valid('2D', '3D', '4D').messages({
      'any.only': '"Type" must be one of: 2D, 3D, or 4D',
      'any.required': '"Type" is required',
    }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: `Validation failed: ${error.details[0].message}`,
    });
  }

  next();
};

module.exports = {
  createValidation,
  updateValidation,
};
