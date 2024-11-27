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

  describe('getMe', () => {
    it('should return current user details', async () => {
      mockReq.user = { id: faker.string.uuid(), name: faker.person.fullName() };

      await usersController.getMe(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockReq.user);
      expect(mockRes.message).toEqual('current user details');
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Error fetching user');
      mockReq.user = null;

      await usersController.getMe(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(mockReq, mockRes, error, 400);
    });
  });

  describe('getAll', () => {
    it('should fetch all users and return status 200', async () => {
      const users = Array.from({ length: 5 }, () => ({
        id: faker.string.uuid(),
        email: faker.internet.email(),
      }));
      userService.getAll.mockResolvedValue(users);

      mockReq.query = { page: 1, limit: 10 };

      await usersController.getAll(mockReq, mockRes, mockNext);

      expect(userService.getAll).toHaveBeenCalledWith(mockReq.query);
      expect(mockRes.message).toEqual('users details fetched Successfully!');
      expect(mockRes.data).toEqual(users);
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching users', async () => {
      const error = new Error('Database error');
      userService.getAll.mockRejectedValue(error);

      await usersController.getAll(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(mockReq, mockRes, error, 404);
    });
  });

  describe('get', () => {
    it('should fetch user by ID and return status 200', async () => {
      const user = { id: faker.string.uuid(), name: faker.person.fullName() };
      userService.get.mockResolvedValue(user);

      mockReq.params.id = user.id;

      await usersController.get(mockReq, mockRes, mockNext);

      expect(userService.get).toHaveBeenCalledWith({ id: user.id });
      expect(mockRes.data).toEqual(user);
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle "user not found" error', async () => {
      userService.get.mockResolvedValue(null);

      mockReq.params.id = faker.string.uuid();

      await usersController.get(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        'user not found',
        404,
      );
    });
  });

  describe('update', () => {
    it('should update user and return status 200', async () => {
      const updatedUser = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
      };
      userService.update.mockResolvedValue(updatedUser);

      mockReq.params = updatedUser.id;
      mockReq.body = { name: updatedUser.name };

      await usersController.update(mockReq, mockRes, mockNext);

      expect(userService.update).toHaveBeenCalledWith({
        id: mockReq.params,
        body: mockReq.body,
      });
      expect(mockRes.message).toEqual('User updated successfully!');
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when updating user', async () => {
      const error = new Error('Update failed');
      userService.update.mockRejectedValue(error);

      await usersController.update(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(mockReq, mockRes, error, 400);
    });
  });

  describe('remove', () => {
    it('should delete user and return status 200', async () => {
      mockReq.params.id = faker.string.uuid();

      await usersController.remove(mockReq, mockRes);

      expect(userService.remove).toHaveBeenCalledWith({
        id: mockReq.params.id,
      });
      expect(mockRes.message).toEqual('User deleted successfully');
      expect(mockRes.statusCode).toEqual(200);
      expect(responseHandler).toHaveBeenCalledWith(mockReq, mockRes);
    });

    it('should handle errors when deleting user', async () => {
      const error = new Error('User not found');
      userService.remove.mockRejectedValue(error);

      await usersController.remove(mockReq, mockRes);

      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        'User not found',
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
        'Fetch users booking details successfully!',
      );
      expect(mockRes.data).toEqual(bookings);
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching bookings', async () => {
      const error = new Error('Error fetching bookings');
      userService.getBookings.mockRejectedValue(error);

      await usersController.getBookings(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(mockReq, mockRes, error, 400);
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
        'Transaction of specific user fetched successfully!',
      );
      expect(mockRes.data).toEqual(transactions);
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching transactions', async () => {
      const error = new Error('Error fetching transactions');
      userService.getTransactions.mockRejectedValue(error);

      await usersController.getTransactions(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(mockReq, mockRes, error, 400);
    });
  });

  describe('getReport', () => {
    it('should fetch reports and return status 200', async () => {
      const reports = { totalUsers: 100, totalBookings: 500 };

      mockReq.query = { page: 1, limit: 10 };

      userService.getReports.mockResolvedValue(reports);

      await usersController.getReport(mockReq, mockRes, mockNext);

      expect(userService.getReports).toHaveBeenCalledWith(mockReq.query);
      expect(mockRes.data).toEqual({
        ...reports,
        page: parseInt(mockReq.query.page, 10),
        limit: parseInt(mockReq.query.limit, 10),
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching reports', async () => {
      const error = new Error('Error fetching reports');
      userService.getReports.mockRejectedValue(error);

      await usersController.getReport(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(mockReq, mockRes, error, 400);
    });
  });
});
