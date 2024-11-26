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
const { THEATER_OWNER } = require('../constants/roles.constant.js').roles;

router.post(
  '/',
  authMiddleware,
  rbacMiddleware([THEATER_OWNER]),
  createValidation,
  showController.create,
  showsSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/',
  authMiddleware,
  showController.getAll,
  showsSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  showController.get,
  showsSerializer.serialize,
  commonHelper.responseHandler,
);

router.patch(
  '/:id',
  authMiddleware,
  rbacMiddleware([THEATER_OWNER]),
  updateValidation,
  showController.update,
  showsSerializer.serialize,
  commonHelper.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware([THEATER_OWNER]),
  showController.remove,
  commonHelper.responseHandler,
);

module.exports = router;
