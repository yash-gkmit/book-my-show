const transactionService = require('../services/transactions.service');
const {
  errorHandler,
  responseHandler,
} = require('../helpers/common.helper.js');

const generate = async (req, res) => {
  try {
    const transaction = await transactionService.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Error creating transaction:', error.message);
    return res.status(400).json({
      success: false,
      message:
        error.message || 'An error occurred while creating the transaction.',
    });
  }
};

const fetchAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    const result = await transactionService.getAll(filters, page, limit);

    res.data = result;
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    console.error(error);

    if (error.statusCode) {
      errorHandler(req, res, error.message, error.statusCode);
    } else {
      errorHandler(req, res, 'Transaction not found', 404);
    }
  }
};

module.exports = {
  generate,
  fetchAll,
};
