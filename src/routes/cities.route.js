const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cities.controller');
const commonHelper = require('../helpers/common.helper');
const { createCity, updateCity } = require('../validators/cities.validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const citiesSerializer = require('../serializers/cities.serializer');
const { ADMIN } = require('../constants/roles.constant.js').roles;

router.post(
  '/',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  createCity,
  cityController.create,
  citiesSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/',
  cityController.getAll,
  citiesSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/reports',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  cityController.getReport,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  cityController.get,
  citiesSerializer.serialize,
  commonHelper.responseHandler,
);

router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  updateCity,
  cityController.update,
  citiesSerializer.serialize,
  commonHelper.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  cityController.remove,
  commonHelper.responseHandler,
);

router.get(
  '/:id/theaters',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  cityController.getTheaters,
  citiesSerializer.theaterSerialize,
  commonHelper.responseHandler,
);

module.exports = router;
