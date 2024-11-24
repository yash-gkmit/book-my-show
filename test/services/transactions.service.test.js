const { faker } = require('@faker-js/faker');
const {
  create,
  getAll,
  get,
  remove,
} = require('../../src/services/transactions.service');
const { Transaction, Booking, sequelize } = require('../../src/models');

jest.mock('../../src/models');
jest.mock('../../src/helpers/mail.helper', () => ({
  sendTransactionEmail: jest.fn(),
}));

describe('Transaction Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw an error if booking is not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      Booking.findByPk.mockResolvedValue(null);

      const data = {
        user_id: faker.string.uuid(),
        booking_id: faker.string.uuid(),
        transaction_amount: faker.number.int({ min: 100, max: 500 }),
      };

      await expect(create(data)).rejects.toEqual('Booking not found');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw an error if user is not found for the booking', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const mockBooking = {
        id: faker.string.uuid(),
        user: null, // Simulating no user
        show: {
          available_seats: 100,
          movie: { name: faker.lorem.words() },
          save: jest.fn(),
        },
        save: jest.fn(),
      };

      Booking.findByPk.mockResolvedValue(mockBooking);

      const data = {
        user_id: faker.string.uuid(),
        booking_id: mockBooking.id,
        transaction_amount: faker.number.int({ min: 100, max: 500 }),
      };

      await expect(create(data)).rejects.toEqual(
        'User not found for this booking',
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return all transactions with pagination', async () => {
      const mockTransactions = [...Array(5)].map(() => ({
        id: faker.string.uuid(),
        booking: {
          show: { movie: { name: faker.lorem.words() } },
        },
      }));

      Transaction.findAndCountAll.mockResolvedValue({
        count: 5,
        rows: mockTransactions,
      });

      const filters = {};
      const page = 1;
      const limit = 5;
      const result = await getAll(filters, page, limit);

      expect(Transaction.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
          offset: 0,
          limit,
          order: [['created_at', 'DESC']],
        }),
      );

      expect(result.data.length).toBe(5);
      expect(result.pagination.totalItems).toBe(5);
      expect(result.pagination.totalPages).toBe(1);
    });
  });

  describe('get', () => {
    it('should return a transaction by ID', async () => {
      const mockTransaction = {
        id: faker.string.uuid(),
        booking: {
          show: { movie: { name: faker.lorem.words() } },
        },
      };

      Transaction.findOne.mockResolvedValue(mockTransaction);

      const transaction = await get(mockTransaction.id);

      expect(Transaction.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockTransaction.id },
          include: expect.any(Array),
        }),
      );
      expect(transaction).toEqual(mockTransaction);
    });

    it('should throw an error if transaction is not found', async () => {
      Transaction.findOne.mockResolvedValueOnce(null);

      await expect(get(faker.string.uuid())).rejects.toEqual(
        'Transaction not found',
      );
    });
  });

  describe('remove', () => {
    it('should remove a transaction by ID', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const mockTransactionRecord = { destroy: jest.fn() };
      Transaction.findByPk.mockResolvedValue(mockTransactionRecord);

      const id = faker.string.uuid();
      const result = await remove(id);

      expect(Transaction.findByPk).toHaveBeenCalledWith(id, {
        transaction: mockTransaction,
      });
      expect(mockTransactionRecord.destroy).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Transaction removed successfully' });
    });
  });
});
