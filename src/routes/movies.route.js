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

router.post(
  '/',
  authMiddleware,
  rbacMiddleware(['Theater Owner']),
  upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'trailer', maxCount: 1 },
  ]),
  createValidation,
  moviesController.generate,
);

router.get('/', authMiddleware, moviesController.fetchAll);

router.get(
  '/reports',
  authMiddleware,
  rbacMiddleware(['Admin']),
  moviesController.fetchReport,
);

router.get('/:id', authMiddleware, moviesController.fetchById);

router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Theater Owner']),
  updateValidation,
  moviesController.change,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin', 'Theater Owner']),
  moviesController.remove,
);

router.get(
  '/:id/theaters',
  authMiddleware,
  rbacMiddleware(['Admin', 'Theater Owner']),
  moviesController.getTheatersByMovieId,
);

module.exports = router;
