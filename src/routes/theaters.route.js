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
  theaterController.create,
  theatersSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  theaterController.getAll,
  theatersSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/reports',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  theaterController.getReport,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN, THEATER_OWNER]),
  theaterController.get,
  theatersSerializer.serialize,
  commonHelper.responseHandler,
);

router.patch(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN, THEATER_OWNER]),
  updateValidation,
  theaterController.update,
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
  theaterController.getMovies,
  theatersSerializer.movieSerialize,
  commonHelper.responseHandler,
);

module.exports = router;
