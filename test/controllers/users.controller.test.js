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
      expect(mockRes.message).toEqual('Current user details');
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

      expect(userService.getAll).toHaveBeenCalledWith(1, 10);
      expect(mockRes.message).toEqual('Users details fetched Successfully!');
      expect(mockRes.data).toEqual(users);
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching users', async () => {
      const errorMessage = 'Database error';
      const error = new Error(errorMessage); // Create an Error object
      userService.getAll.mockRejectedValue(error); // Mock the rejection with an Error object

      await usersController.fetchAll(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        error, // Pass the Error object
        404,
      );
    });
  });

  describe('fetch', () => {
    it('should fetch user by ID and return status 200', async () => {
      const user = { id: faker.string.uuid(), name: faker.person.fullName() };
      userService.get.mockResolvedValue(user);

      mockReq.params.id = user.id;

      await usersController.fetch(mockReq, mockRes, mockNext);

      expect(userService.get).toHaveBeenCalledWith(user.id);
      expect(mockRes.data).toEqual(user);
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle "User not found" error', async () => {
      userService.get.mockResolvedValue(null);

      mockReq.params.id = faker.string.uuid();

      await usersController.fetch(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        'User not found',
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

      expect(userService.update).toHaveBeenCalledWith(
        updatedUser.id,
        mockReq.body,
      );
      expect(mockRes.message).toEqual('User updated successfully!');
      expect(mockRes.data).toEqual(updatedUser);
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle "User not found" error', async () => {
      userService.update.mockRejectedValue(new Error('User not found'));

      mockReq.params.id = faker.string.uuid();
      mockReq.body = { name: faker.person.fullName() };

      await usersController.change(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        'User not found',
        404,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete user and return status 200', async () => {
      mockReq.params.id = faker.string.uuid();

      await usersController.remove(mockReq, mockRes);

      expect(userService.remove).toHaveBeenCalledWith(mockReq.params.id);
      expect(mockRes.message).toEqual('User soft deleted successfully');
      expect(mockRes.statusCode).toEqual(200);
      expect(responseHandler).toHaveBeenCalledWith(mockReq, mockRes);
    });

    it('should handle "User not found" error', async () => {
      userService.remove.mockRejectedValue(new Error('User not found'));

      mockReq.params.id = faker.string.uuid();

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
        movie: faker.lorem.word(),
      }));
      userService.getBookings.mockResolvedValue(bookings);

      mockReq.params.id = faker.string.uuid();
      mockReq.query = { page: 1, limit: 10 };

      await usersController.getBookings(mockReq, mockRes, mockNext);

      expect(userService.getBookings).toHaveBeenCalledWith(
        mockReq.params.id,
        {},
        1,
        10,
      );
      expect(mockRes.message).toEqual(
        'Fetch users booking details successfully!',
      );
      expect(mockRes.data).toEqual(bookings);
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching bookings', async () => {
      const errorMessage = 'Error fetching bookings';
      userService.getBookings.mockRejectedValue(new Error(errorMessage));

      await usersController.getBookings(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        'An error occurred while fetching bookings.',
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
      mockReq.query = { page: 1, limit: 10 };

      await usersController.getTransactions(mockReq, mockRes, mockNext);

      expect(userService.getTransactions).toHaveBeenCalledWith(
        mockReq.params.id,
        {},
        1,
        10,
      );
      expect(mockRes.message).toEqual(
        'Transaction of specific user fetched successfully!',
      );
      expect(mockRes.data).toEqual(transactions);
      expect(mockRes.statusCode).toEqual(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching transactions', async () => {
      const errorMessage = 'Error fetching transactions';
      userService.getTransactions.mockRejectedValue(new Error(errorMessage));

      await usersController.getTransactions(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'An error occurred while fetching bookings.',
        error: new Error(errorMessage),
      });
    });
  });

  describe('fetchReports', () => {
    it('should fetch reports and return status 200', async () => {
      const reports = { totalUsers: 100, totalBookings: 500 };
      userService.getReports.mockResolvedValue(reports);

      mockReq.query = { page: 1, limit: 10 };

      await usersController.fetchReports(mockReq, mockRes, mockNext);

      expect(userService.getReports).toHaveBeenCalledWith(1, 10);
      expect(mockRes.data).toEqual({
        ...reports,
        page: 1,
        limit: 10,
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching reports', async () => {
      const errorMessage = 'Error fetching reports';
      const error = new Error(errorMessage); // Create an Error object
      userService.getReports.mockRejectedValue(error); // Mock rejection with the Error object

      await usersController.fetchReports(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        error, // Pass the Error object
        400,
      );
    });
  });
});
