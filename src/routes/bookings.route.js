const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookings.controller');
const {
  createValidation,
  updateValidation,
} = require('../validators/bookings.validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');

router.post('/', authMiddleware, createValidation, bookingController.generate);
router.get('/', authMiddleware, bookingController.fetchAll);

router.get(
  '/reports',
  authMiddleware,
  rbacMiddleware(['Admin']),
  bookingController.fetchReports,
);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin', 'Theater Owner']),
  bookingController.fetchById,
);

router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Self']),
  updateValidation,
  bookingController.change,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin', 'Self']),
  bookingController.remove,
);

module.exports = router;
