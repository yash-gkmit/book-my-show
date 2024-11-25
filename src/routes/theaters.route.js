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
const { THEATER_OWNER, ADMIN } =
  require('../constants/roles.constant.js').roles;

router.post(
  '/',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  createValidation,
  theaterController.generate,
  theatersSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  theaterController.fetchAll,
  theatersSerializer.serialize,
  commonHelper.responseHandler,
);

router.post(
  '/reports',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  theaterController.fetchReports,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN, THEATER_OWNER]),
  theaterController.fetch,
  theatersSerializer.serialize,
  commonHelper.responseHandler,
);

router.patch(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN, THEATER_OWNER]),
  updateValidation,
  theaterController.change,
  theatersSerializer.serialize,
  commonHelper.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN, THEATER_OWNER]),
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
