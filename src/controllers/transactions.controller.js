const transactionService = require('../services/transactions.service');
const {
  errorHandler,
  throwCustomError,
} = require('../helpers/common.helper.js');

const create = async (req, res, next) => {
  const payload = req.body;
  try {
    if (payload.userId !== req.user.id) {
      throwCustomError(
        'You are not authorize to do transaction of that specific booking!',
        403,
      );
    }

    const transaction = await transactionService.create(payload);

    res.message =
      'Transaction genearted successfully, Please check your mail for bill!';
    res.data = transaction;
    res.statusCode = 201;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const getAll = async (req, res, next) => {
  const filters = req.query;
  try {
    const result = await transactionService.getAll(filters);
    res.message = 'Transaction details fetched successfully!';
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 404);
  }
};

const get = async (req, res, next) => {
  const payload = req.params;
  try {
    const transaction = await transactionService.get(payload);
    res.data = transaction;
    res.message = 'Detail fetched successfully!';
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 404);
  }
};

const remove = async (req, res, next) => {
  const payload = req.params;
  try {
    await transactionService.remove(payload);
    res.message = 'Transaction deleted successfully!';
    res.statusCode = 204;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 404);
  }
};

module.exports = {
  create,
  getAll,
  get,
  remove,
};
