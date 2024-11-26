const userService = require('../services/users.service');
const { errorHandler, responseHandler } = require('../helpers/common.helper');

const getMe = async (req, res, next) => {
  try {
    res.data = req.user;
    res.message = 'current user details';
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, err.statusCode || 400);
  }
};

const getAll = async (req, res, next) => {
  const query = req.query;

  try {
    const users = await userService.getAll(query);

    res.message = 'users details fetched Successfully!';
    res.data = users;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, 404);
  }
};

const get = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await userService.get({ id });
    if (!user) {
      return errorHandler(req, res, 'user not found', 404);
    }
    res.data = user;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, 404);
  }
};

const update = async (req, res, next) => {
  const payload = {
    id: req.params,
    body: req.body,
  };

  try {
    await userService.update(payload);
    res.message = 'User updated successfully!';
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, 400);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;
  try {
    await userService.remove({ id });
    res.message = 'User deleted successfully';
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    if (error.message === 'User not found') {
      return errorHandler(req, res, 'User not found', 404);
    }
    errorHandler(req, res, error, 400);
  }
};

const getBookings = async (req, res, next) => {
  const payload = {
    id: req.params,
    filters: req.query,
  };

  try {
    const result = await userService.getBookings(payload);
    res.message = 'Fetch users booking details successfully!';
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const getTransactions = async (req, res, next) => {
  const payload = {
    id: req.params,
    filters: req.query,
  };

  try {
    const result = await userService.getTransactions(payload);

    res.message = 'Transaction of specific user fetched successfully!';
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const getReport = async (req, res, next) => {
  const filters = req.query;

  try {
    const data = await userService.getReports(filters);

    res.data = {
      ...data,
      page: parseInt(filters.page, 10),
      limit: parseInt(filters.page, 10),
    };

    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

module.exports = {
  getMe,
  getAll,
  get,
  update,
  remove,
  getBookings,
  getTransactions,
  getReport,
};
