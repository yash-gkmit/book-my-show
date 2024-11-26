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
  usersController.getMe,
  usersSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  usersController.getAll,
  usersSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/reports',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  usersController.getReport,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  usersController.get,
  usersSerializer.serialize,
  commonHelper.responseHandler,
);

router.patch(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN], true),
  usersValidator.updateValidation,
  usersController.update,
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
