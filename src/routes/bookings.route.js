const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookings.controller');
const { createValidation } = require('../validators/bookings.validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');

router.post('/', authMiddleware, createValidation, bookingController.generate);
router.get('/', authMiddleware, bookingController.fetchAll);
router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin', 'Theater Owner']),
  bookingController.fetchById,
);

module.exports = router;
