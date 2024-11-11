const { check } = require('express-validator');

exports.createValidation = [
  check('name')
    .isString()
    .isLength({ max: 50 })
    .withMessage('Name must be a string with a maximum length of 50'),
  check('address').isString().notEmpty().withMessage('Address is required'),
  check('city_id').isUUID().withMessage('City ID must be a valid UUID'),
];

exports.updateValidation = [
  check('name')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('Invalid name'),
  check('address')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Invalid address'),
];
