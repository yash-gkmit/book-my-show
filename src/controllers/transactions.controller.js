const transactionService = require('../services/transactions.service');
const {
  errorHandler,
  throwCustomError,
} = require('../helpers/common.helper.js');

const generate = async (req, res, next) => {
  try {
    if (req.body.userId !== req.user.id) {
      throwCustomError(
        'You are not authorize to do transaction of that specific booking!',
        403,
      );
    }
    const transaction = await transactionService.create(req.body);

    res.message =
      'Transaction genearted successfully, Please check your mail for bill.!';
    res.data = transaction;
    res.statusCode = 201;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const fetchAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    const result = await transactionService.getAll(filters, page, limit);

    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.error(error);

    errorHandler(req, res, error, error.statusCode || 404);
  }
};

const fetch = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.get(id);

    res.data = transaction;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.error(error);

    if (error.statusCode) {
      errorHandler(req, res, error.message, error.statusCode);
    } else {
      errorHandler(req, res, 'Transaction not found', 404);
    }
  }
};

const remove = async (req, res, next) => {
  try {
    await transactionService.remove(req.params.id);
    res.data = {
      message: 'Transaction deleted successfully!',
    };
    res.statusCode = 204;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, 404);
  }
};

module.exports = {
  generate,
  fetchAll,
  fetch,
  remove,
};
