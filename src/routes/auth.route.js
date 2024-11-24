const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authValidator = require('../validators/auth.validator');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.post(
  '/register',
  authValidator.registerValidation,
  authController.register,
);

router.post('/send-otp', authController.sendOtp);

router.post(
  '/verify-otp',
  authValidator.otpValidation,
  authController.verifyOtp,
);

router.post('/login', authValidator.loginValidation, authController.login);

router.delete('/logout', authMiddleware, authController.logout);
module.exports = router;
