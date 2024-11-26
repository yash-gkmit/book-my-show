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
const { ADMIN, THEATER_OWNER } =
  require('../constants/roles.constant.js').roles;

router.post(
  '/',
  authMiddleware,
  createValidation,
  bookingController.create,
  bookingsSerializer.serialize,
  commonHandler.responseHandler,
);
router.get(
  '/',
  authMiddleware,
  bookingController.getAll,
  bookingsSerializer.serialize,
  commonHandler.responseHandler,
);

router.get(
  '/reports',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  bookingController.getReport,
  commonHandler.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN, THEATER_OWNER]),
  bookingController.get,
  bookingsSerializer.serialize,
  commonHandler.responseHandler,
);

router.patch(
  '/:id',
  authMiddleware,
  updateValidation,
  bookingController.update,
  bookingsSerializer.serialize,
  commonHandler.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  bookingController.remove,
  commonHandler.responseHandler,
);

module.exports = router;
