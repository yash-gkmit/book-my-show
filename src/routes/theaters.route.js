const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theaters.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const {
  createValidation,
  updateValidation,
} = require('../validators/theaters.validator');

router.post(
  '/',
  authMiddleware,
  rbacMiddleware(['Admin']),
  createValidation,
  theaterController.generate,
);

router.get(
  '/',
  authMiddleware,
  rbacMiddleware(['Admin']),
  theaterController.fetchAll,
);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin', 'Theater Owner']),
  theaterController.fetchById,
);

router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Theater Owner']),
  updateValidation,
  theaterController.change,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin']),
  theaterController.remove,
);

router.get('/cities/:city_id', authMiddleware, theaterController.fetchByCity);
router.get('/:id/movies', authMiddleware, theaterController.fetchMovies);

module.exports = router;
