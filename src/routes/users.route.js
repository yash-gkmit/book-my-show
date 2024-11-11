const express = require('express');
const {
	fetchAll,
	fetchById,
	change,
	remove,
} = require('../controllers/users.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');

const router = express.Router();

router.get('/', authMiddleware, rbacMiddleware(['Admin']), fetchAll);

router.get(
	'/:user_id',
	authMiddleware,
	rbacMiddleware(['Admin', 'self']),
	fetchById,
);

router.put(
	'/:user_id',
	authMiddleware,
	rbacMiddleware(['Admin', 'self']),
	change,
);

router.delete('/:user_id', authMiddleware, rbacMiddleware(['Admin']), remove);

module.exports = router;
