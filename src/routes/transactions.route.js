const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const commonHelper = require('../helpers/common.helper');
const transactionsSerialize = require('../serializers/transactions.serializer');
const { ADMIN } = require('../constants/roles.constant.js').roles;

router.post(
  '/',
  authMiddleware,
  transactionController.create,
  transactionsSerialize.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  transactionController.getAll,
  transactionsSerialize.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN], true),
  transactionController.get,
  transactionsSerialize.serialize,
  commonHelper.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN], true),
  transactionController.remove,
  commonHelper.responseHandler,
);

module.exports = router;
