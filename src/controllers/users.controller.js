const userService = require('../services/users.service');
const {
  errorHandler,
  responseHandler,
  throwCustomError,
} = require('../helpers/common.helper');

const fetchAll = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const users = await userService.getAll(page, limit);

    res.data = users;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.error('Error fetching users:', error);
    errorHandler(req, res, error.message, 404);
  }
};
const fetchById = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    if (!user) {
      return errorHandler(req, res, 'User not found', 404);
    }
    res.data = user;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, 404);
  }
};

const change = async (req, res, next) => {
  const userId = req.params.id;
  const userData = req.body;

  try {
    const updatedUser = await userService.update(userId, userData);
    res.data = updatedUser;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    if (error.message === 'User not found') {
      return errorHandler(req, res, 'User not found', 404);
    }
    errorHandler(req, res, error.message, 400);
  }
};

const remove = async (req, res) => {
  try {
    await userService.remove(req.params.id);
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

const getBookings = async (req, res, next) => {
  const { id } = req.params;
  const { page = 1, limit = 10, filters = {} } = req.query;
  try {
    const { selectedRole, user_id } = req.user;

    if (selectedRole !== 'Admin' && user_id !== id) {
      throwCustomError('Not authorized for fetching details');
    }
    const result = await userService.getBookings(
      id,
      filters,
      parseInt(page),
      parseInt(limit),
    );
    res.data = {
      message: 'Booking of specific user fetched successfully!',
      result,
    };
    res.statusCode = 200;
    next();
  } catch (error) {
    console.error('Error fetching bookings:', error);
    errorHandler(req, res, 'An error occurred while fetching bookings.', 400);
  }
};

const getTransactions = async (req, res, next) => {
  const { id } = req.params;
  const { page = 1, limit = 10, filters = {} } = req.query;
  try {
    const { selectedRole, user_id } = req.user;

    if (selectedRole !== 'Admin' && user_id !== id) {
      throwCustomError('Not authorized for fetching details');
    }
    const result = await userService.getTransactions(
      id,
      filters,
      parseInt(page),
      parseInt(limit),
    );

    res.data = {
      message: 'Transaction of user fetched successfully!',
      result,
    };
    res.statusCode = 200;
    next();
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(400).json({
      message: 'An error occurred while fetching bookings.',
      error: error.message,
    });
  }
};

const fetchReports = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const data = await userService.getReports(parsedPage, parsedLimit);

    res.data = {
      ...data,
      page: parsedPage,
      limit: parsedLimit,
    };

    next();
  } catch (error) {
    console.error('Error fetching reports:', error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

module.exports = {
  fetchAll,
  fetchById,
  change,
  remove,
  getBookings,
  getTransactions,
  fetchReports,
};
