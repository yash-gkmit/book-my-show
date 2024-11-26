const { faker } = require('@faker-js/faker');
const {
  create,
  getAll,
  get,
  remove,
} = require('../../src/services/transactions.service');
const { Transaction, Booking, sequelize } = require('../../src/models');
const { sendTransactionEmail } = require('../../src/helpers/mail.helper');

jest.mock('../../src/models');
jest.mock('../../src/helpers/mail.helper', () => ({
  sendTransactionEmail: jest.fn(),
}));

jest.mock('../../src/helpers/common.helper', () => ({
  throwCustomError: jest.fn(),
}));

describe('Transaction Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    sequelize.transaction = jest.fn().mockImplementation(() => ({
      commit: jest.fn(),
      rollback: jest.fn(),
    }));
  });

  describe('create', () => {
    it('should throw an error if booking is not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      Booking.findByPk.mockResolvedValue(null);

      const data = {
        userId: faker.string.uuid(),
        bookingId: faker.string.uuid(),
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
        userId: faker.string.uuid(),
        bookingId: mockBooking.id,
      };

      await expect(create(data)).rejects.toEqual(
        'User not found for this booking',
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw an error if booking has no associated show', async () => {
      const mockBooking = {
        id: faker.string.uuid(),
        total_amount: faker.finance.amount(),
        user: { email: faker.internet.email() },
        show: null,
      };

      Booking.findByPk.mockResolvedValueOnce(mockBooking);

      const data = { bookingId: mockBooking.id };

      await expect(create(data)).rejects.toEqual('Show not found');
      //expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should handle errors during transaction and rollback changes', async () => {
      const mockBooking = {
        id: faker.string.uuid(),
        total_amount: faker.finance.amount(),
        user: { email: faker.internet.email() },
        show: {
          available_seats: 100,
        },
        save: jest.fn(),
      };

      Booking.findByPk.mockResolvedValueOnce(mockBooking);
      Transaction.create.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const data = {
        userId: faker.string.uuid(),
        bookingId: mockBooking.id,
      };

      await expect(create(data)).rejects.toThrow('Database error');
      //expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should send transaction email after successful transaction', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const mockBooking = {
        id: faker.string.uuid(),
        total_amount: faker.finance.amount(),
        number_of_seats: 2,
        user: { email: faker.internet.email() },
        show: {
          available_seats: 100,
          movie: { name: faker.lorem.words() },
          show_time: '10:00 AM',
          show_date: '2024-11-30',
          save: jest.fn(),
        },
        save: jest.fn(),
      };

      Booking.findByPk.mockResolvedValueOnce(mockBooking);
      Transaction.create.mockResolvedValue({
        id: faker.string.uuid(),
        transaction_status: 'Success',
        transaction_amount: mockBooking.total_amount,
        GST: 0,
        CGST: 0,
        IGST: 0,
        SGST: 0,
      });

      sendTransactionEmail.mockResolvedValue(true);

      const data = {
        userId: faker.string.uuid(),
        bookingId: mockBooking.id,
      };

      await create(data);

      expect(sendTransactionEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockBooking.user.email,
          subject: 'Transaction Completed',
          description: 'Your booking transaction was successful.',
        }),
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
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
