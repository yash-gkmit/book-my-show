const express = require('express');
const router = express.Router();
const moviesController = require('../controllers/movies.controller');
const upload = require('../middlewares/multer.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { rbacMiddleware } = require('../middlewares/rbac.middleware');
const { createValidation } = require('../validators/movies.validator');

router.post(
  '/',
  authMiddleware,
  rbacMiddleware(['Theater Owner']),
  upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'trailer', maxCount: 1 },
  ]),
  createValidation,
  moviesController.create,
);

module.exports = router;
