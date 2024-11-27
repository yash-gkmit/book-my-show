const { Booking, Show, Movie, sequelize } = require('../../src/models');
const bookingService = require('../../src/services/bookings.service');
const { faker } = require('@faker-js/faker');
// const { throwCustomError } = require('../../src/helpers/common.helper');

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
        showId: dummyShow.id,
        numberOfSeats: 2,
        bookingDate: faker.date.future(),
      };

      Show.findByPk.mockResolvedValue(dummyShow);
      Booking.create.mockResolvedValue({
        ...bookingData,
        id: faker.string.uuid(),
        total_amount: 1000, // 2 * 500
        booking_status: 'Pending',
      });

      const result = await bookingService.create({
        id: { id: bookingData.user_id },
        body: bookingData,
      });

      expect(Show.findByPk).toHaveBeenCalledWith(dummyShow.id);
      expect(Booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          total_amount: 1000, // 2 * 500
          booking_status: 'Pending',
        }),
      );
      expect(dummyShow.save).toHaveBeenCalled();
      expect(fakeTransaction.commit).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.total_amount).toEqual(1000);
    });

    it('should throw an error if the show does not exist', async () => {
      Show.findByPk.mockResolvedValue(null);

      await expect(
        bookingService.create({
          id: { id: faker.string.uuid() },
          body: { showId: faker.string.uuid() },
        }),
      ).rejects.toThrow('Show not found');

      expect(fakeTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw an error if not enough seats are available', async () => {
      const dummyShow = { id: faker.string.uuid(), available_seats: 1 };

      Show.findByPk.mockResolvedValue(dummyShow);

      await expect(
        bookingService.create({
          id: { id: faker.string.uuid() },
          body: { showId: dummyShow.id, numberOfSeats: 2 },
        }),
      ).rejects.toThrow('Seats not available');

      expect(fakeTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw an error if the show is not available on the selected booking date', async () => {
      const dummyShow = {
        id: faker.string.uuid(),
        show_time: faker.date.past().toISOString(),
        available_seats: 100,
      };

      Show.findByPk.mockResolvedValue(dummyShow);

      await expect(
        bookingService.create({
          id: { id: faker.string.uuid() },
          body: { showId: dummyShow.id, bookingDate: faker.date.future() },
        }),
      ).rejects.toThrow('Show not available for that date');

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

      const result = await bookingService.getAll({ page: 1, limit: 10 }, 1, 10);

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

      const result = await bookingService.get({ id: dummyBooking.id });

      expect(Booking.findByPk).toHaveBeenCalledWith(dummyBooking.id);
      expect(result).toEqual(dummyBooking);
    });

    it('should throw an error if booking does not exist', async () => {
      Booking.findByPk.mockResolvedValue(null);

      await expect(
        bookingService.get({ id: faker.string.uuid() }),
      ).rejects.toThrow('Booking not found');
    });
  });

  describe('update', () => {
    it('should update a booking', async () => {
      const dummyBooking = { id: faker.string.uuid(), update: jest.fn() };
      const dummyShow = { price: 500, id: faker.string.uuid() };

      Booking.findByPk.mockResolvedValue(dummyBooking);
      Show.findOne.mockResolvedValue(dummyShow);

      const updatedData = { booking_status: 'Confirmed', numberOfSeats: 3 };

      const result = await bookingService.update({
        id: dummyBooking.id,
        body: updatedData,
      });

      expect(Booking.findByPk).toHaveBeenCalledWith(dummyBooking.id);
      expect(dummyBooking.update).toHaveBeenCalledWith(
        expect.objectContaining({
          total_amount: 1500, // 3 * 500
        }),
      );
      expect(result).toEqual(dummyBooking);
    });

    it('should throw an error if booking does not exist', async () => {
      Booking.findByPk.mockResolvedValue(null);

      await expect(
        bookingService.update({ id: faker.string.uuid(), body: {} }),
      ).rejects.toThrow('Booking not found');
    });

    it('should throw an error if booking is already confirmed', async () => {
      const dummyBooking = {
        id: faker.string.uuid(),
        booking_status: 'Confirmed',
      };

      Booking.findByPk.mockResolvedValue(dummyBooking);

      await expect(
        bookingService.update({
          id: dummyBooking.id,
          body: { booking_status: 'Canceled' },
        }),
      ).rejects.toThrow('Not allowed to upadte confirmed booking');
    });
  });

  describe('remove', () => {
    it('should cancel a booking and mark it as canceled', async () => {
      const dummyBooking = { id: faker.string.uuid(), destroy: jest.fn() };

      Booking.findByPk.mockResolvedValue(dummyBooking);

      await bookingService.remove({ id: dummyBooking.id });

      expect(Booking.update).toHaveBeenCalledWith(
        { booking_status: 'Canceled' },
        { where: { id: dummyBooking.id } },
      );
      expect(dummyBooking.destroy).toHaveBeenCalled();
    });

    it('should throw an error if booking does not exist', async () => {
      Booking.findByPk.mockResolvedValue(null);

      await expect(
        bookingService.remove({ id: faker.string.uuid() }),
      ).rejects.toThrow('Booking not found');
    });

    it('should throw an error if booking is already confirmed', async () => {
      const dummyBooking = {
        id: faker.string.uuid(),
        booking_status: 'Confirmed',
      };

      Booking.findByPk.mockResolvedValue(dummyBooking);

      await expect(
        bookingService.remove({ id: dummyBooking.id }),
      ).rejects.toThrow('Sold out ticket can not be refunded or exchanged!');
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

      const result = await bookingService.getReport();

      expect(Booking.count).toHaveBeenCalled();
      expect(Booking.sum).toHaveBeenCalledWith('total_amount');
      expect(result.totalBookings).toEqual(10);
      expect(result.revenueGenerated).toEqual(1000);
      expect(result.BookedMovies).toHaveLength(1);
    });
  });
});
