const transactionController = require('../../src/controllers/transactions.controller');
const transactionService = require('../../src/services/transactions.service');
const { errorHandler } = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');

// Mock dependencies
jest.mock('../../src/services/transactions.service');
jest.mock('../../src/helpers/common.helper');

describe('Transaction Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: faker.string.uuid() }, // Mocking user ID
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      data: null,
      statusCode: null,
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a transaction successfully', async () => {
      const transactionData = { id: faker.string.uuid() };
      transactionService.create.mockResolvedValue(transactionData);

      req.body = { userId: req.user.id, bookingId: faker.string.uuid() };

      await transactionController.create(req, res, next);

      expect(transactionService.create).toHaveBeenCalledWith(req.body);
      expect(res.message).toBe(
        'Transaction genearted successfully, Please check your mail for bill!',
      );
      expect(res.data).toEqual(transactionData);
      expect(res.statusCode).toBe(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle unauthorized transaction creation', async () => {
      const errorMessage =
        'You are not authorize to do transaction of that specific booking!';
      req.body = {
        userId: faker.string.uuid(),
        bookingId: faker.string.uuid(),
      };

      await transactionController.create(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        new Error(errorMessage),
        403,
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors during transaction creation', async () => {
      const errorMessage = 'Error creating transaction';
      const error = new Error(errorMessage);
      transactionService.create.mockRejectedValue(error);

      await transactionController.create(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, error, 400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should fetch all transactions successfully', async () => {
      const transactions = [{ id: faker.string.uuid() }];
      transactionService.getAll.mockResolvedValue(transactions);

      req.query = { page: 1, limit: 10 };

      await transactionController.getAll(req, res, next);

      expect(transactionService.getAll).toHaveBeenCalledWith(req.query);
      expect(res.message).toBe('Transaction details fetched successfully!');
      expect(res.data).toEqual(transactions);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when fetching transactions', async () => {
      const errorMessage = 'Transactions not found';
      transactionService.getAll.mockRejectedValue(new Error(errorMessage));

      await transactionController.getAll(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        'Transactions not found',
        404,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should fetch a transaction by ID successfully', async () => {
      const transaction = { id: faker.string.uuid() };
      transactionService.get.mockResolvedValue(transaction);

      req.params.id = faker.string.uuid();

      await transactionController.get(req, res, next);

      expect(transactionService.get).toHaveBeenCalledWith(req.params);
      expect(res.message).toBe('Detail fetched successfully!');
      expect(res.data).toEqual(transaction);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when fetching a transaction by ID', async () => {
      const errorMessage = 'Transaction not found';
      const error = new Error(errorMessage);
      transactionService.get.mockRejectedValue(error);

      await transactionController.get(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, error, 404);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a transaction successfully', async () => {
      req.params.id = faker.string.uuid();

      await transactionController.remove(req, res, next);

      expect(transactionService.remove).toHaveBeenCalledWith(req.params);
      expect(res.message).toBe('Transaction deleted successfully!');
      expect(res.statusCode).toBe(204);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when deleting a transaction', async () => {
      const errorMessage = 'Transaction not found';
      const error = new Error(errorMessage);

      transactionService.remove.mockRejectedValue(error);

      await transactionController.remove(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, error, 404);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
