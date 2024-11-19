const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');

router.post('/', authMiddleware, transactionController.generate);

router.get('/', authMiddleware, transactionController.fetchAll);

router.get('/:id', authMiddleware, transactionController.fetchById);

router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin', 'Self']),
  transactionController.remove,
);

module.exports = router;
