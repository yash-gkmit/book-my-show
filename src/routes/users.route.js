const express = require('express');
const usersController = require('../controllers/users.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const commonHelper = require('../helpers/common.helper');
const usersSerializer = require('../serializers/users.serializer');
const usersValidator = require('../validators/users.validator');
const { ADMIN } = require('../constants/roles.constant.js').roles;

const router = express.Router();

router.get(
  '/me',
  authMiddleware,
  usersController.fetchCurrent,
  usersSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  usersController.fetchAll,
  usersSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/reports',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  usersController.fetchReports,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  usersController.fetch,
  usersSerializer.serialize,
  commonHelper.responseHandler,
);

router.patch(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN], true),
  usersValidator.updateValidation,
  usersController.change,
  usersSerializer.serialize,
  commonHelper.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN], true),
  usersController.remove,
);

router.get(
  '/:id/bookings',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  usersController.getBookings,
  usersSerializer.bookingSerialize,
  commonHelper.responseHandler,
);

router.get(
  '/:id/transactions',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  usersController.getTransactions,
  usersSerializer.bookingSerialize,
  commonHelper.responseHandler,
);

module.exports = router;
