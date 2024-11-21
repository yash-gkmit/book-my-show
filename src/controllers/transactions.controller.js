const transactionService = require('../services/transactions.service');
const { errorHandler } = require('../helpers/common.helper.js');

const generate = async (req, res, next) => {
  try {
    const transaction = await transactionService.create(req.body);

    (res.data = transaction), (res.statusCode = 201), next();
  } catch (error) {
    console.error('Error creating transaction:', error.message);
    errorHandler(
      req,
      res,
      error.message || 'An error occurred while creating the transaction.',
      400,
    );
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

    if (error.statusCode) {
      errorHandler(req, res, error.message, error.statusCode);
    } else {
      errorHandler(req, res, 'Transaction not found', 404);
    }
  }
};

const fetchById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.getById(id);

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
  fetchById,
  remove,
};
