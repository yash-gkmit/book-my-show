const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const commonHelper = require('../helpers/common.helper');
const transactionsSerialize = require('../serializers/transactions.serializer');

router.post(
  '/',
  authMiddleware,
  transactionController.generate,
  transactionsSerialize.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/',
  authMiddleware,
  transactionController.fetchAll,
  transactionsSerialize.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  transactionController.fetch,
  transactionsSerialize.serialize,
  commonHelper.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin'], true),
  transactionController.remove,
  commonHelper.responseHandler,
);

module.exports = router;
