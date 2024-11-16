const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');

router.post(
  '/',
  authMiddleware,
  rbacMiddleware(['Self']),
  transactionController.generate,
);

router.get('/', authMiddleware, transactionController.fetchAll);

module.exports = router;
