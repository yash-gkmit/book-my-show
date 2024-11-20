const express = require('express');
const usersController = require('../controllers/users.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const commonHelper = require('../helpers/common.helper');
const userBookingSerializer = require('../serializers/usersBooking.serializer');
const usersSerializer = require('../serializers/users.serializer');

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  rbacMiddleware(['Admin']),
  usersController.fetchAll,
  usersSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/reports',
  authMiddleware,
  rbacMiddleware(['Admin']),
  usersController.fetchReports,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin', 'self']),
  usersController.fetchById,
  usersSerializer.serialize,
  commonHelper.responseHandler,
);

router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin', 'self']),
  usersController.change,
  usersSerializer.serialize,
  commonHelper.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin']),
  usersController.remove,
);

router.get(
  '/:id/bookings',
  authMiddleware,
  usersController.getBookings,
  userBookingSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/:id/transactions',
  authMiddleware,
  usersController.getTransactions,
  userBookingSerializer.serialize,
  commonHelper.responseHandler,
);

module.exports = router;
