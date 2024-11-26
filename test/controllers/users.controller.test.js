const userService = require('../../src/services/users.service');
const {
  errorHandler,
  responseHandler,
} = require('../../src/helpers/common.helper');
const usersController = require('../../src/controllers/users.controller');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/services/users.service');
jest.mock('../../src/helpers/common.helper');

describe('Users Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { params: {}, body: {}, query: {}, user: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      data: null,
      message: null,
      statusCode: null,
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('fetchCurrent', () => {
    it('should return current user details', async () => {
      mockReq.user = { id: faker.string.uuid(), name: faker.person.fullName() };

      await usersController.fetchCurrent(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockReq.user);
      expect(mockRes.message).toEqual('current user details');
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('fetchAll', () => {
    it('should fetch all users and return status 200', async () => {
      const users = Array.from({ length: 5 }, () => ({
        id: faker.string.uuid(),
        email: faker.internet.email(),
      }));
      userService.getAll.mockResolvedValue(users);

      mockReq.query = { page: 1, limit: 10 };

      await usersController.fetchAll(mockReq, mockRes, mockNext);

      expect(userService.getAll).toHaveBeenCalledWith(mockReq.query);
      expect(mockRes.message).toEqual('users details fetched Successfully!');
      expect(mockRes.data).toEqual(users);
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching users', async () => {
      const error = new Error('Database error');
      userService.getAll.mockRejectedValue(error);

      await usersController.fetchAll(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(mockReq, mockRes, error, 404);
    });
  });

  describe('fetch', () => {
    it('should fetch user by ID and return status 200', async () => {
      const user = { id: faker.string.uuid(), name: faker.person.fullName() };
      userService.get.mockResolvedValue(user);

      mockReq.params.id = user.id;

      await usersController.fetch(mockReq, mockRes, mockNext);

      expect(userService.get).toHaveBeenCalledWith({ id: user.id });
      expect(mockRes.data).toEqual(user);
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle "user not found" error', async () => {
      userService.get.mockResolvedValue(null);

      mockReq.params.id = faker.string.uuid();

      await usersController.fetch(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        'user not found',
        404,
      );
    });
  });

  describe('change', () => {
    it('should update user and return status 200', async () => {
      const updatedUser = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
      };
      userService.update.mockResolvedValue(updatedUser);

      mockReq.params.id = updatedUser.id;
      mockReq.body = { name: updatedUser.name };

      await usersController.change(mockReq, mockRes, mockNext);

      expect(userService.update).toHaveBeenCalledWith({
        id: updatedUser.id,
        data: mockReq.body,
      });
      expect(mockRes.message).toEqual('user updated successfully!');
      expect(mockRes.data).toEqual(updatedUser);
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle "user not found" error', async () => {
      const error = new Error('user not found');
      userService.update.mockRejectedValue(error);

      mockReq.params.id = faker.string.uuid();

      await usersController.change(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        'user not found',
        404,
      );
    });
  });

  describe('remove', () => {
    it('should delete user and return status 200', async () => {
      mockReq.params.id = faker.string.uuid();

      await usersController.remove(mockReq, mockRes);

      expect(userService.remove).toHaveBeenCalledWith({
        id: mockReq.params.id,
      });
      expect(mockRes.message).toEqual('user deleted successfully');
      expect(mockRes.statusCode).toEqual(200);
      expect(responseHandler).toHaveBeenCalledWith(mockReq, mockRes);
    });

    it('should handle "user not found" error', async () => {
      const error = new Error('user not found');
      userService.remove.mockRejectedValue(error);

      mockReq.params.id = faker.string.uuid();

      await usersController.remove(mockReq, mockRes);

      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        'user not found',
        404,
      );
    });
  });

  describe('getBookings', () => {
    it('should fetch user bookings and return status 200', async () => {
      const bookings = Array.from({ length: 3 }, () => ({
        id: faker.string.uuid(),
        details: faker.lorem.sentence(),
      }));
      userService.getBookings.mockResolvedValue(bookings);

      mockReq.params.id = faker.string.uuid();
      mockReq.query = { filter: 'active' };

      await usersController.getBookings(mockReq, mockRes, mockNext);

      expect(userService.getBookings).toHaveBeenCalledWith({
        id: mockReq.params,
        filters: mockReq.query,
      });
      expect(mockRes.message).toEqual(
        'fetch users booking details successfully!',
      );
      expect(mockRes.data).toEqual(bookings);
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching bookings', async () => {
      const error = new Error('Error fetching bookings');
      userService.getBookings.mockRejectedValue(error);

      await usersController.getBookings(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        'an error occurred while fetching bookings.',
        400,
      );
    });
  });

  describe('getTransactions', () => {
    it('should fetch user transactions and return status 200', async () => {
      const transactions = Array.from({ length: 3 }, () => ({
        id: faker.string.uuid(),
        amount: faker.finance.amount(),
      }));
      userService.getTransactions.mockResolvedValue(transactions);

      mockReq.params.id = faker.string.uuid();
      mockReq.query = { filter: 'completed' };

      await usersController.getTransactions(mockReq, mockRes, mockNext);

      expect(userService.getTransactions).toHaveBeenCalledWith({
        id: mockReq.params,
        filters: mockReq.query,
      });
      expect(mockRes.message).toEqual(
        'transaction of specific user fetched successfully!',
      );
      expect(mockRes.data).toEqual(transactions);
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching transactions', async () => {
      const errorMessage = 'Error fetching transactions';
      userService.getTransactions.mockRejectedValue(new Error(errorMessage));

      await usersController.getTransactions(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        'an error occurred while fetching transactions.',
        400,
      );
    });
  });

  describe('fetchReports', () => {
    it('should fetch reports and return status 200', async () => {
      const reports = { totalUsers: 100, totalBookings: 500 };

      mockReq.query = { page: 1, limit: 10 };

      userService.getReports.mockResolvedValue(reports);

      await usersController.fetchReports(mockReq, mockRes, mockNext);

      expect(userService.getReports).toHaveBeenCalledWith(mockReq.query);

      expect(mockRes.data).toBe({
        ...reports,
        page: 1,
        limit: 10, // Ensure this matches mockReq.query.limit
      });

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching reports', async () => {
      const error = new Error('Error fetching reports');
      userService.getReports.mockRejectedValue(error);

      await usersController.fetchReports(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(mockReq, mockRes, error, 400);
    });
  });
});
