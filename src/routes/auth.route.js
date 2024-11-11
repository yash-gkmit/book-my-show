const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authValidator = require('../validators/auth.validator');

router.post(
	'/register',
	authValidator.registerValidation,
	authController.register,
);

module.exports = router;
