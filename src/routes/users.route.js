const express = require('express');
const usersController = require('../controllers/users.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const commonHelper = require('../helpers/common.helper');
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
  usersController.fetch,
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
  rbacMiddleware(['Admin']),
  usersController.getBookings,
  usersSerializer.bookingSerialize,
  commonHelper.responseHandler,
);

router.get(
  '/:id/transactions',
  authMiddleware,
  rbacMiddleware(['Admin']),
  usersController.getTransactions,
  usersSerializer.bookingSerialize,
  commonHelper.responseHandler,
);

module.exports = router;
