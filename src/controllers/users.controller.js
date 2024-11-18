const userService = require('../services/users.service');
const { errorHandler, responseHandler } = require('../helpers/common.helper');

const fetchAll = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const users = await userService.getAll(page, limit);

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching users.',
      error: error.message,
    });
  }
};
const fetchById = async (req, res) => {
  try {
    const user = await userService.getById(req.params.id);
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

const change = async (req, res) => {
  const userId = req.params.id;
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

const getBookings = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, filters = {} } = req.query;
  try {
    const result = await userService.getBookings(
      id,
      filters,
      parseInt(page),
      parseInt(limit),
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(400).json({
      message: 'An error occurred while fetching bookings.',
      error: error.message,
    });
  }
};

const getTransactions = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, filters = {} } = req.query;
  try {
    const result = await userService.getTransactions(
      id,
      filters,
      parseInt(page),
      parseInt(limit),
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(400).json({
      message: 'An error occurred while fetching bookings.',
      error: error.message,
    });
  }
};

const fetchReports = async (req, res) => {
  try {
    const data = await userService.getReports();
    res.data = data;
    responseHandler(req, res);
  } catch (error) {
    console.error(error);
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
