const express = require('express');
const showController = require('../controllers/shows.controller');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  createValidation,
  updateValidation,
} = require('../validators/shows.validator');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const commonHelper = require('../helpers/common.helper');
const showsSerializer = require('../serializers/shows.serializer');

router.post(
  '/',
  authMiddleware,
  rbacMiddleware(['Theater Owner']),
  createValidation,
  showController.generate,
  showsSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/',
  authMiddleware,
  showController.fetchAll,
  showsSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  showController.fetchById,
  showsSerializer.serialize,
  commonHelper.responseHandler,
);

router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Theater Owner']),
  updateValidation,
  showController.change,
  showsSerializer.serialize,
  commonHelper.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Theater Owner', 'Admin']),
  showController.remove,
  commonHelper.responseHandler,
);

module.exports = router;
