const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cities.controller');
const { createCity, updateCity } = require('../validators/cities.validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');

router.post(
  '/',
  authMiddleware,
  rbacMiddleware(['Admin']),
  createCity,
  cityController.generate,
);

router.get('/', cityController.fetchAll);

router.get('/:id', cityController.fetchById);

router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin']),
  updateCity,
  cityController.change,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin']),
  cityController.remove,
);

module.exports = router;
