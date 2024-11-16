const transactionService = require('../services/transactions.service');

const createTransaction = async (req, res) => {
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

module.exports = {
  createTransaction,
};
