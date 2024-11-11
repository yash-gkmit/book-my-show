const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cities.controller');
const { createCity } = require('../validators/cities.validator');
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

module.exports = router;
