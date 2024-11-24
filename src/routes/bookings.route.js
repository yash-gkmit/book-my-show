const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookings.controller');
const {
  createValidation,
  updateValidation,
} = require('../validators/bookings.validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const commonHandler = require('../helpers/common.helper');
const bookingsSerializer = require('../serializers/bookings.serializer');

router.post(
  '/',
  authMiddleware,
  createValidation,
  bookingController.generate,
  bookingsSerializer.serialize,
  commonHandler.responseHandler,
);
router.get(
  '/',
  authMiddleware,
  bookingController.fetchAll,
  bookingsSerializer.serialize,
  commonHandler.responseHandler,
);

router.get(
  '/reports',
  authMiddleware,
  rbacMiddleware(['Admin']),
  bookingController.fetchReports,
  commonHandler.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin', 'Theater Owner']),
  bookingController.fetch,
  bookingsSerializer.serialize,
  commonHandler.responseHandler,
);

router.patch(
  '/:id',
  authMiddleware,
  updateValidation,
  bookingController.change,
  bookingsSerializer.serialize,
  commonHandler.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin'], true),
  bookingController.remove,
  commonHandler.responseHandler,
);

module.exports = router;
