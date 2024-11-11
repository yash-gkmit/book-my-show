const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theaters.controller');
const { validatorMiddleware } = require('../middlewares/validator.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const { createValidation } = require('../validators/theaters.validator');

router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test route is working' });
});

router.post(
  '/',
  authMiddleware,
  rbacMiddleware(['Admin']),
  createValidation,
  validatorMiddleware,
  theaterController.generate,
);

router.get(
  '/',
  authMiddleware,
  rbacMiddleware(['Admin']),
  theaterController.fetchAll,
);

module.exports = router;
