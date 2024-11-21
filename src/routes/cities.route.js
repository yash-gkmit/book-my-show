const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cities.controller');
const commonHelper = require('../helpers/common.helper');
const { createCity, updateCity } = require('../validators/cities.validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const citiesSerializer = require('../serializers/cities.serializer');
const cityTheaterSerializer = require('../serializers/cityTheater.serializer');

router.post(
  '/',
  authMiddleware,
  rbacMiddleware(['Admin']),
  createCity,
  cityController.generate,
  citiesSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/',
  cityController.fetchAll,
  citiesSerializer.serialize,
  commonHelper.responseHandler,
);
router.get(
  '/reports',
  authMiddleware,
  rbacMiddleware(['Admin']),
  cityController.fetchReport,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  cityController.fetchById,
  citiesSerializer.serialize,
  commonHelper.responseHandler,
);

router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin']),
  updateCity,
  cityController.change,
  citiesSerializer.serialize,
  commonHelper.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin']),
  cityController.remove,
  commonHelper.responseHandler,
);

router.get(
  '/:id/theaters',
  authMiddleware,
  rbacMiddleware(['Admin']),
  cityController.fetchTheaters,
  cityTheaterSerializer.serialize,
  commonHelper.responseHandler,
);

module.exports = router;
