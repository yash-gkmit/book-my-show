const express = require('express');
const { fetchAll } = require('../controllers/users.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');

const router = express.Router();

router.get('/', authMiddleware, rbacMiddleware(['Admin']), fetchAll);

module.exports = router;
