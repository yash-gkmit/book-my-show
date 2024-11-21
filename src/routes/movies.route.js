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

router.post(
  '/',
  authMiddleware,
  rbacMiddleware(['Theater Owner']),
  upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'trailer', maxCount: 1 },
  ]),
  createValidation,
  rbacMiddleware(['Theater Owner']),
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

router.get(
  '/reports',
  authMiddleware,
  rbacMiddleware(['Admin']),
  moviesController.fetchReport,
  moviesSerializer.serialize,
  commonHelper.responseHandler,
);

router.get(
  '/:id',
  authMiddleware,
  moviesController.fetchById,
  moviesSerializer.serialize,
  commonHelper.responseHandler,
);

router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Theater Owner']),
  updateValidation,
  moviesController.change,
  moviesSerializer.serialize,
  commonHelper.responseHandler,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin', 'Theater Owner']),
  moviesController.remove,
  commonHelper.responseHandler,
);

router.get(
  '/:id/theaters',
  authMiddleware,
  rbacMiddleware(['Admin', 'Theater Owner']),
  moviesController.getTheatersByMovieId,
  //moviesSerializer.serialize,
  commonHelper.responseHandler,
);

module.exports = router;
