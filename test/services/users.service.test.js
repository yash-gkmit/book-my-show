const { faker } = require('@faker-js/faker');
const { sequelize } = require('../../src/models');
const {
  getAll,
  get,
  update,
  remove,
  getBookings,
  getTransactions,
  getReports,
} = require('../../src/services/users.service');
const { throwCustomError } = require('../../src/helpers/common.helper');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');

describe('User Service Tests', () => {
  let mockUser, mockBooking, mockTransaction, mockPayload;

  beforeEach(() => {
    mockUser = {
      id: faker.number.int(),
      name: faker.name.fullName(),
      email: faker.internet.email(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      update: jest.fn(),
    };

    mockBooking = {
      id: faker.number.int(),
      userId: mockUser.id,
      showId: faker.number.int(),
      numberOfSeats: faker.number.int({ min: 1, max: 10 }),
      totalAmount: faker.finance.amount(),
      createdAt: faker.date.past(),
    };

    mockTransaction = {
      id: faker.number.int(),
      userId: mockUser.id,
      bookingId: mockBooking.id,
      status: 'Success',
      amount: mockBooking.totalAmount,
      createdAt: faker.date.past(),
    };

    mockPayload = {
      id: mockUser.id,
      filters: { status: 'Success' },
      page: 1,
      limit: 10,
    };

    throwCustomError.mockImplementation((message, status) => {
      const error = new Error(message);
      error.statusCode = status;
      throw error;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated list of users', async () => {
      sequelize.models.User.findAll.mockResolvedValue([mockUser]);
      sequelize.models.User.count.mockResolvedValue(10);

      const payload = { page: 1, limit: 10 };
      const result = await getAll(payload);

      expect(result.users).toHaveLength(1);
      expect(result.pagination).toEqual({
        totalItems: 10,
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1,
      });
    });

    it('should handle errors', async () => {
      sequelize.models.User.findAll.mockRejectedValue(
        new Error('Database Error'),
      );

      await expect(getAll({ page: 1, limit: 10 })).rejects.toThrow(
        'Database Error',
      );
    });
  });

  describe('get', () => {
    it('should return a user by ID', async () => {
      sequelize.models.User.findByPk.mockResolvedValue(mockUser);

      const payload = { id: mockUser.id };
      const result = await get(payload);

      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      sequelize.models.User.findByPk.mockResolvedValue(null);

      const payload = { id: 1 };
      await expect(get(payload)).rejects.toThrow(
        'user with this id does not exist',
      );
    });
  });

  describe('update', () => {
    it('should update a user and commit transaction', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(transaction);
      sequelize.models.User.findByPk.mockResolvedValue(mockUser);
      mockUser.update.mockResolvedValue(mockUser);

      const payload = {
        id: mockUser.id,
        data: { name: faker.name.firstName() },
      };
      const result = await update(payload);

      expect(transaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should rollback on error', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(transaction);
      sequelize.models.User.findByPk.mockResolvedValue(null);

      const payload = { id: 1, data: {} };
      await expect(update(payload)).rejects.toThrow('user not found');
      expect(transaction.rollback).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a user and commit transaction', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(transaction);
      sequelize.models.User.findByPk.mockResolvedValue(mockUser);

      const payload = { id: mockUser.id };
      const result = await remove(payload);

      expect(transaction.commit).toHaveBeenCalled();
      expect(result.message).toEqual('user deleted successfully');
    });

    it('should rollback on error', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(transaction);
      sequelize.models.User.findByPk.mockResolvedValue(null);

      const payload = { id: 1 };
      await expect(remove(payload)).rejects.toThrow('User not found');
      expect(transaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getBookings', () => {
    it('should return filtered bookings with pagination', async () => {
      sequelize.models.Booking.findAndCountAll.mockResolvedValue({
        rows: [mockBooking],
        count: 1,
      });

      const result = await getBookings(mockPayload);

      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual({
        totalItems: 1,
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1,
      });
    });

    it('should handle errors', async () => {
      sequelize.models.Booking.findAndCountAll.mockRejectedValue(
        new Error('Error'),
      );

      await expect(getBookings(mockPayload)).rejects.toThrow('Error');
    });
  });

  describe('getTransactions', () => {
    it('should return filtered transactions with pagination', async () => {
      sequelize.models.Transaction.findAndCountAll.mockResolvedValue({
        rows: [mockTransaction],
        count: 1,
      });

      const result = await getTransactions(mockPayload);

      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual({
        totalItems: 1,
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1,
      });
    });

    it('should handle errors', async () => {
      sequelize.models.Transaction.findAndCountAll.mockRejectedValue(
        new Error('Error'),
      );

      await expect(getTransactions(mockPayload)).rejects.toThrow('Error');
    });
  });

  describe('getReports', () => {
    it('should return registration reports', async () => {
      sequelize.models.User.count
        .mockResolvedValueOnce(100) // Total users
        .mockResolvedValueOnce(10); // New registrations
      sequelize.models.User.findAll.mockResolvedValue([
        { registrationDate: faker.date.past(), count: 5 },
      ]);

      const payload = { page: 1, limit: 10 };
      const result = await getReports(payload);

      expect(result.totalUsers).toBe(100);
      expect(result.newRegistrations).toBe(10);
      expect(result.registrationHistory).toHaveLength(1);
    });

    it('should handle errors', async () => {
      sequelize.models.User.count.mockRejectedValue(new Error('Error'));

      await expect(getReports({ page: 1, limit: 10 })).rejects.toThrow('Error');
    });
  });
});
