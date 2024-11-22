const transactionController = require('../../src/controllers/transactions.controller');
const transactionService = require('../../src/services/transactions.service');
const {
  responseHandler,
  errorHandler,
} = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/services/transactions.service');
jest.mock('../../src/helpers/common.helper');

describe('Transaction Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      data: null,
      statusCode: null,
    };
    jest.clearAllMocks();
  });

  describe('generate', () => {
    it('should create a transaction successfully', async () => {
      const newTransaction = {
        id: faker.string.uuid(),
        amount: 500,
        status: 'Success',
      };
      transactionService.create.mockResolvedValue(newTransaction);

      req.body = { amount: 500, status: 'Success' };

      await transactionController.generate(req, res, jest.fn());

      expect(transactionService.create).toHaveBeenCalledWith(req.body);
      expect(res.statusCode).toBe(201);
      expect(res.data).toEqual(newTransaction);
      expect(responseHandler).toHaveBeenCalledWith(req, res);
    });

    it('should handle errors during transaction creation', async () => {
      const errorMessage = 'Failed to create transaction';
      transactionService.create.mockRejectedValue(new Error(errorMessage));

      await transactionController.generate(req, res, jest.fn());

      expect(transactionService.create).toHaveBeenCalledWith(req.body);
      expect(res.statusCode).toBe(400);
      expect(res.data).toEqual({
        success: false,
        message: errorMessage,
      });
      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('fetchAll', () => {
    it('should fetch all transactions successfully', async () => {
      const transactions = [
        { id: faker.string.uuid(), amount: 100, status: 'Success' },
        { id: faker.string.uuid(), amount: 200, status: 'Pending' },
      ];
      const paginationInfo = { page: 1, limit: 10, totalRecords: 2 };
      transactionService.getAll.mockResolvedValue({
        data: transactions,
        ...paginationInfo,
      });

      req.query = { page: 1, limit: 10 };

      await transactionController.fetchAll(req, res, jest.fn());

      expect(transactionService.getAll).toHaveBeenCalledWith({}, 1, 10);
      expect(res.data).toEqual({
        data: transactions,
        page: 1,
        limit: 10,
        totalRecords: 2,
      });
      expect(res.statusCode).toBe(200);
      expect(responseHandler).toHaveBeenCalledWith(req, res);
    });

    it('should handle errors during fetching transactions', async () => {
      const errorMessage = 'Transaction not found';
      transactionService.getAll.mockRejectedValue(new Error(errorMessage));

      await transactionController.fetchAll(req, res, jest.fn());

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        'Transaction not found',
        404,
      );
    });
  });

  describe('fetch', () => {
    it('should fetch a transaction by ID successfully', async () => {
      const transaction = {
        id: faker.string.uuid(),
        amount: 100,
        status: 'Success',
      };
      transactionService.get.mockResolvedValue(transaction);

      req.params.id = transaction.id;

      await transactionController.fetch(req, res, jest.fn());

      expect(transactionService.get).toHaveBeenCalledWith(req.params.id);
      expect(res.data).toEqual(transaction);
      expect(res.statusCode).toBe(200);
      expect(responseHandler).toHaveBeenCalledWith(req, res);
    });

    it('should handle errors when fetching transaction by ID fails', async () => {
      const errorMessage = 'Transaction not found';
      transactionService.get.mockRejectedValue(new Error(errorMessage));

      req.params.id = faker.string.uuid();

      await transactionController.fetch(req, res, jest.fn());

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        'Transaction not found',
        404,
      );
    });
  });

  describe('remove', () => {
    it('should delete a transaction successfully', async () => {
      req.params.id = faker.string.uuid();

      transactionService.remove.mockResolvedValue();

      await transactionController.remove(req, res, jest.fn());

      expect(transactionService.remove).toHaveBeenCalledWith(req.params.id);
      expect(res.data).toEqual({
        message: 'Transaction deleted successfully!',
      });
      expect(res.statusCode).toBe(204);
      expect(responseHandler).toHaveBeenCalledWith(req, res);
    });

    it('should handle errors during transaction deletion', async () => {
      const errorMessage = 'Transaction not found';
      transactionService.remove.mockRejectedValue(new Error(errorMessage));

      req.params.id = faker.string.uuid();

      await transactionController.remove(req, res, jest.fn());

      expect(transactionService.remove).toHaveBeenCalledWith(req.params.id);
      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 404);
    });
  });
});
