const { check } = require('express-validator');
const { validatorMiddleware } = require('../middlewares/validator.middleware');

exports.registerValidation = [
  check('email').isEmail().withMessage('Invalid email'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validatorMiddleware,
];

exports.otpValidation = [
  check('email').isEmail(),
  check('otp').isNumeric().isLength({ min: 6, max: 6 }),
  validatorMiddleware,
];
