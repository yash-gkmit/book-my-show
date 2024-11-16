const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.post('/', authMiddleware, transactionController.createTransaction);

module.exports = router;
