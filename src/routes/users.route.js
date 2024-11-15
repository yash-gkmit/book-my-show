const express = require('express');
const {
  fetchAll,
  fetchById,
  change,
  remove,
  getBookings,
  getTransactions,
} = require('../controllers/users.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');

const router = express.Router();

router.get('/', authMiddleware, rbacMiddleware(['Admin']), fetchAll);

router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware(['Admin', 'self']),
  fetchById,
);

router.put('/:id', authMiddleware, rbacMiddleware(['Admin', 'self']), change);

router.delete('/:id', authMiddleware, rbacMiddleware(['Admin']), remove);

router.get(
  '/:id/bookings',
  authMiddleware,
  rbacMiddleware(['Admin', 'Self']),
  getBookings,
);

router.get(
  '/:id/transactions',
  authMiddleware,
  rbacMiddleware(['Admin', 'Self']),
  getTransactions,
);

module.exports = router;
