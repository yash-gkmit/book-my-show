const { Booking, Show, Movie, sequelize } = require('../../src/models');
const bookingService = require('../../src/services/bookings.service');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');

describe('Booking Service', () => {
  const fakeTransaction = { commit: jest.fn(), rollback: jest.fn() };

  beforeAll(() => {
    sequelize.transaction = jest.fn(() => fakeTransaction);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new booking if seats are available', async () => {
      const dummyShow = {
        id: faker.string.uuid(),
        available_seats: 100,
        price: 500,
        save: jest.fn(),
      };
      const bookingData = {
        user_id: faker.string.uuid(),
        show_id: dummyShow.id,
        number_of_seat: 2,
        booking_date: faker.date.future(),
      };

      Show.findByPk.mockResolvedValue(dummyShow);
      Booking.create.mockResolvedValue({
        ...bookingData,
        id: faker.string.uuid(),
      });

      const result = await bookingService.create(bookingData);

      expect(Show.findByPk).toHaveBeenCalledWith(dummyShow.id, {
        transaction: fakeTransaction,
      });
      expect(Booking.create).toHaveBeenCalledWith(
        {
          ...bookingData,
          total_amount: 1000, // 2 * 500
          booking_status: 'Pending',
        },
        { transaction: fakeTransaction },
      );
      expect(fakeTransaction.commit).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw an error if the show does not exist', async () => {
      Show.findByPk.mockResolvedValue(null);

      await expect(
        bookingService.create({ show_id: faker.string.uuid() }),
      ).rejects.toThrow('Show not found');

      expect(fakeTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw an error if not enough seats are available', async () => {
      const dummyShow = { id: faker.string.uuid(), available_seats: 1 };

      Show.findByPk.mockResolvedValue(dummyShow);

      await expect(
        bookingService.create({ show_id: dummyShow.id, number_of_seat: 2 }),
      ).rejects.toThrow('Seats not available');

      expect(fakeTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return paginated bookings', async () => {
      const dummyBookings = [
        {
          id: faker.string.uuid(),
          user_id: faker.string.uuid(),
          show: {
            id: faker.string.uuid(),
            movie: {
              id: faker.string.uuid(),
              name: faker.commerce.productName(),
            },
          },
        },
      ];
      Booking.findAndCountAll.mockResolvedValue({
        rows: dummyBookings,
        count: 1,
      });

      const result = await bookingService.getAll({}, 1, 10);

      expect(Booking.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: [
          {
            model: Show,
            as: 'show',
            include: [{ model: Movie, as: 'movie' }],
          },
        ],
        offset: 0,
        limit: 10,
        order: [['created_at', 'DESC']],
      });
      expect(result.data).toEqual(dummyBookings);
      expect(result.pagination).toEqual({
        totalItems: 1,
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1,
      });
    });
  });

  describe('getById', () => {
    it('should return a booking by ID', async () => {
      const dummyBooking = {
        id: faker.string.uuid(),
        user_id: faker.string.uuid(),
      };

      Booking.findByPk.mockResolvedValue(dummyBooking);

      const result = await bookingService.get(dummyBooking.id);

      expect(Booking.findByPk).toHaveBeenCalledWith(dummyBooking.id);
      expect(result).toEqual(dummyBooking);
    });

    it('should throw an error if booking does not exist', async () => {
      Booking.findByPk.mockResolvedValue(null);

      await expect(bookingService.get(faker.string.uuid())).rejects.toThrow(
        'Booking not found',
      );
    });
  });

  describe('update', () => {
    it('should update a booking', async () => {
      const dummyBooking = { id: faker.string.uuid(), update: jest.fn() };

      Booking.findByPk.mockResolvedValue(dummyBooking);

      const updatedData = { booking_status: 'Confirmed' };

      const result = await bookingService.update(dummyBooking.id, updatedData);

      expect(Booking.findByPk).toHaveBeenCalledWith(dummyBooking.id, {
        transaction: fakeTransaction,
      });
      expect(dummyBooking.update).toHaveBeenCalledWith(updatedData, {
        transaction: fakeTransaction,
      });
      expect(fakeTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(dummyBooking);
    });

    it('should throw an error if booking does not exist', async () => {
      Booking.findByPk.mockResolvedValue(null);

      await expect(
        bookingService.update(faker.string.uuid(), {}),
      ).rejects.toThrow('Booking not found');
    });
  });

  describe('remove', () => {
    it('should cancel a booking and mark it as canceled', async () => {
      const dummyBooking = { id: faker.string.uuid(), destroy: jest.fn() };

      Booking.findByPk.mockResolvedValue(dummyBooking);

      await bookingService.remove(dummyBooking.id);

      expect(Booking.update).toHaveBeenCalledWith(
        { booking_status: 'Canceled' },
        { where: { id: dummyBooking.id } },
      );
      expect(dummyBooking.destroy).toHaveBeenCalled();
    });

    it('should throw an error if booking does not exist', async () => {
      Booking.findByPk.mockResolvedValue(null);

      await expect(bookingService.remove(faker.string.uuid())).rejects.toThrow(
        'Booking not found',
      );
    });
  });

  describe('getReports', () => {
    it('should return booking reports', async () => {
      Booking.count.mockResolvedValue(10);
      Booking.sum.mockResolvedValue(1000);
      Booking.findAll.mockResolvedValue([
        {
          get: jest.fn().mockImplementation(field => {
            const data = {
              show_id: faker.string.uuid(),
              movie_id: faker.string.uuid(),
              movie_name: faker.commerce.productName(),
              booking_count: 5,
            };
            return data[field];
          }),
        },
      ]);

      const result = await bookingService.getReports();

      expect(Booking.count).toHaveBeenCalled();
      expect(Booking.sum).toHaveBeenCalledWith('total_amount');
      expect(result.totalBookings).toEqual(10);
      expect(result.revenueGenerated).toEqual(1000);
      expect(result.mostBookedMovies).toHaveLength(1);
    });
  });

  describe('cancel', () => {
    it('should cancel a booking if user is authorized', async () => {
      const dummyUser = {
        id: faker.string.uuid(),
        name: faker.name.fullName(),
        email: faker.internet.email(),
      };
      const dummyBooking = {
        id: faker.string.uuid(),
        user_id: dummyUser.id,
        status: 'Confirmed',
        save: jest.fn(),
      };

      Booking.findByPk.mockResolvedValue({ ...dummyBooking, user: dummyUser });

      const result = await bookingService.cancel(dummyBooking.id, dummyUser.id);

      expect(result.status).toEqual('Canceled');
    });

    it('should throw an error if booking does not exist', async () => {
      Booking.findByPk.mockResolvedValue(null);

      await expect(
        bookingService.cancel(faker.string.uuid(), faker.string.uuid()),
      ).rejects.toThrow(
        "Booking not found or you're not authorized to cancel this booking.",
      );
    });

    it('should throw an error if user is not authorized to cancel booking', async () => {
      const dummyUser = {
        id: faker.string.uuid(),
        name: faker.name.fullName(),
        email: faker.internet.email(),
      };
      const dummyBooking = {
        id: faker.string.uuid(),
        user_id: faker.string.uuid(),
        status: 'Confirmed',
        save: jest.fn(),
      };

      Booking.findByPk.mockResolvedValue({ ...dummyBooking, user: dummyUser });

      await expect(
        bookingService.cancel(dummyBooking.id, dummyUser.id),
      ).rejects.toThrow('User not authorized for cancelling this booking');
    });

    it('should throw an error if booking is already canceled', async () => {
      const dummyUser = {
        id: faker.string.uuid(),
        name: faker.name.fullName(),
        email: faker.internet.email(),
      };
      const dummyBooking = {
        id: faker.string.uuid(),
        user_id: dummyUser.id,
        status: 'Canceled',
        save: jest.fn(),
      };

      Booking.findByPk.mockResolvedValue({ ...dummyBooking, user: dummyUser });

      await expect(
        bookingService.cancel(dummyBooking.id, dummyUser.id),
      ).rejects.toThrow('This booking has already been cancelled.');
    });
  });
});
