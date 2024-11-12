const { check } = require('express-validator');
const { validatorMiddleware } = require('../middlewares/validator.middleware');

exports.createValidation = [
  check('name').notEmpty().withMessage('Movie name is required'),
  check('summary').optional().isString(),
  check('release_date').notEmpty().isString(),
  check('cast_member_list')
    .isArray()
    .withMessage('Cast members must be an array'),
  check('genre').isIn([
    'Action',
    'Comedy',
    'Drama',
    'Horror',
    'Sci-Fi',
    'Romance',
  ]),
  check('language').notEmpty().withMessage('Language is required'),
  validatorMiddleware,
];
