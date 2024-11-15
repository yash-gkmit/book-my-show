const express = require('express');
const showController = require('../controllers/shows.controller');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { createValidation } = require('../validators/shows.validator');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');

router.post(
	'/',
	authMiddleware,
	rbacMiddleware(['Theater Owner']),
	createValidation,
	showController.generate,
);

module.exports = router;
