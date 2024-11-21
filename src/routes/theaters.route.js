const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theaters.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const {
  createValidation,
  updateValidation,
} = require('../validators/theaters.validator');

const commonHelper = require('../helpers/common.helper');
const theatersSerializer = require('../serializers/theaters.serializer');

router.post(
  '/',
  authMiddleware,
  rbacMiddleware(['Admin']),
  createValidation,
  theaterController.generate,
  theatersSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/',
  authMiddleware,
  rbacMiddleware(['Admin']),
  theaterController.fetchAll,
  theatersSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/reports',
  authMiddleware,
  rbacMiddleware(['Admin']),
  theaterController.fetchReports,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin', 'Theater Owner']),
  theaterController.fetch,
  theatersSerializer.serialize,
  commonHelper.responseHandler,
);

router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Theater Owner']),
  updateValidation,
  theaterController.change,
  theatersSerializer.serialize,
  commonHelper.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin', 'Theater Owner']),
  theaterController.remove,
  commonHelper.responseHandler,
);

router.get(
  '/:id/movies',
  authMiddleware,
  theaterController.fetchMovies,
  theatersSerializer.movieSerialize,
  commonHelper.responseHandler,
);

module.exports = router;
