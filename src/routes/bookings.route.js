const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookings.controller');
const { createValidation } = require('../validators/bookings.validator');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.post('/', authMiddleware, createValidation, bookingController.generate);

module.exports = router;
