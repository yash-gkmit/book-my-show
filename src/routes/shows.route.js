const express = require('express');
const showController = require('../controllers/shows.controller');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  createValidation,
  updateValidation,
} = require('../validators/shows.validator');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');

router.post(
  '/',
  authMiddleware,
  rbacMiddleware(['Theater Owner']),
  createValidation,
  showController.generate,
);

router.get('/', showController.fetchAll);
router.get('/:id', showController.fetchById);

router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Theater Owner']),
  updateValidation,
  showController.change,
);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Theater Owner', 'Admin']),
  showController.remove,
);

module.exports = router;
