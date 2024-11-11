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
