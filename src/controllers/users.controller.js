const userService = require('../services/users.service');
const { errorHandler, responseHandler } = require('../helpers/common.helper');

exports.fetchAll = async (req, res) => {
  try {
    const users = await userService.getAll();
    if (!users || users.length === 0) {
      return errorHandler(req, res, 'No users found', 404);
    }
    res.data = users;
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, 404);
  }
};

exports.fetchById = async (req, res) => {
  try {
    const user = await userService.getById(req.params.user_id);
    if (!user) {
      return errorHandler(req, res, 'User not found', 404);
    }
    res.data = user;
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, 404);
  }
};

exports.change = async (req, res) => {
  const userId = req.params.user_id;
  const userData = req.body;

  try {
    const updatedUser = await userService.update(userId, userData);
    res.data = updatedUser;
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    if (error.message === 'User not found') {
      return errorHandler(req, res, 'User not found', 404);
    }
    errorHandler(req, res, error.message, 400);
  }
};

exports.remove = async (req, res) => {
  try {
    await userService.delete(req.params.user_id);
    res.data = { message: 'User soft deleted successfully' };
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    if (error.message === 'User not found') {
      return errorHandler(req, res, 'User not found', 404);
    }
    errorHandler(req, res, error.message, 400);
  }
};
