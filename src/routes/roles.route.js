const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roles.controller');
const commonHelper = require('../helpers/common.helper');
const { createRole, updateRole } = require('../validators/roles.validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const rolesSerializer = require('../serializers/roles.serializer');
const { ADMIN } = require('../constants/roles.constant.js').roles;

router.post(
  '/',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  createRole,
  roleController.generate,
  rolesSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  roleController.fetchAll,
  rolesSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  roleController.fetch,
  rolesSerializer.serialize,
  commonHelper.responseHandler,
);

router.patch(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  updateRole,
  roleController.change,
  rolesSerializer.serialize,
  commonHelper.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  roleController.remove,
  commonHelper.responseHandler,
);

module.exports = router;
