const express = require('express');
const router = express.Router();
const moviesController = require('../controllers/movies.controller');
const upload = require('../middlewares/multer.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const {
  createValidation,
  updateValidation,
} = require('../validators/movies.validator');
const commonHelper = require('../helpers/common.helper.js');
const moviesSerializer = require('../serializers/movies.serializer');
const { THEATER_OWNER, ADMIN } =
  require('../constants/roles.constant.js').roles;

router.post(
  '/',
  authMiddleware,
  rbacMiddleware([THEATER_OWNER]),
  upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'trailer', maxCount: 1 },
  ]),
  createValidation,
  moviesController.generate,
  moviesSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/',
  authMiddleware,
  moviesController.fetchAll,
  moviesSerializer.serialize,
  commonHelper.responseHandler,
);

router.post(
  '/reports',
  authMiddleware,
  rbacMiddleware([ADMIN]),
  moviesController.fetchReport,
  moviesSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  moviesController.fetch,
  moviesSerializer.serialize,
  commonHelper.responseHandler,
);

router.patch(
  '/:id',
  authMiddleware,
  rbacMiddleware([THEATER_OWNER]),
  updateValidation,
  moviesController.change,
  moviesSerializer.serialize,
  commonHelper.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware([ADMIN, THEATER_OWNER]),
  moviesController.remove,
  commonHelper.responseHandler,
);

router.get(
  '/:id/theaters',
  authMiddleware,
  rbacMiddleware([ADMIN, THEATER_OWNER]),
  moviesController.getTheatersByMovieId,
  moviesSerializer.theaterSerialize,
  commonHelper.responseHandler,
);

module.exports = router;
