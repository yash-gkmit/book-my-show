const { check } = require('express-validator');
const { validatorMiddleware } = require('../middlewares/validator.middleware');

const createCity = [
  check('name')
    .isString()
    .isLength({ max: 50 })
    .withMessage('City name must be a string up to 50 characters'),
  validatorMiddleware,
];

const updateCity = [
  check('name')
    .isString()
    .isLength({ max: 50 })
    .withMessage('City name must be a string up to 50 characters'),
  validatorMiddleware,
];

module.exports = {
  createCity,
  updateCity,
};
