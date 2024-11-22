const bookingController = require('../../src/controllers/bookings.controller');
const bookingService = require('../../src/services/bookings.service');
const { errorHandler } = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');

// Mock dependencies
jest.mock('../../src/services/bookings.service');
jest.mock('../../src/helpers/common.helper');

describe('Booking Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: faker.string.uuid() },
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
    it('should create a booking and send a successful response', async () => {
      const bookingData = {
        id: faker.string.uuid(),
        showId: faker.string.uuid(),
        userId: faker.string.uuid(),
        status: 'Confirmed',
      };

      bookingService.create.mockResolvedValue(bookingData);

      req.body = { showId: bookingData.showId, userId: bookingData.userId };

      await bookingController.generate(req, res, jest.fn());

      expect(bookingService.create).toHaveBeenCalledWith(req.body);
      expect(res.data).toEqual(bookingData);
      expect(res.statusCode).toEqual(201);
    });

    it('should handle errors during booking creation', async () => {
      const errorMessage = 'Error creating booking';
      bookingService.create.mockRejectedValue(new Error(errorMessage));

      await bookingController.generate(req, res, jest.fn());

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('fetchAll', () => {
    it('should fetch all bookings with pagination', async () => {
      const bookings = [{ id: faker.string.uuid() }];
      bookingService.getAll.mockResolvedValue(bookings);

      req.query = { page: 1, limit: 10 };

      await bookingController.fetchAll(req, res, jest.fn());

      expect(bookingService.getAll).toHaveBeenCalledWith({}, 1, 10);
      expect(res.data).toEqual(bookings);
      expect(res.statusCode).toBe(200);
    });

    it('should handle errors when fetching bookings', async () => {
      const errorMessage = 'Booking not found';
      bookingService.getAll.mockRejectedValue(new Error(errorMessage));

      await bookingController.fetchAll(req, res, jest.fn());

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        'Booking not found',
        404,
      );
    });
  });

  describe('fetch', () => {
    it('should fetch a booking by ID', async () => {
      const booking = { id: faker.string.uuid() };
      bookingService.get.mockResolvedValue(booking);

      req.params.id = faker.string.uuid();

      await bookingController.fetch(req, res, jest.fn());

      expect(bookingService.get).toHaveBeenCalledWith(req.params.id);
      expect(res.data).toEqual({ message: 'Fetched Booking By Id', booking });
      expect(res.statusCode).toEqual(200);
    });

    it('should handle errors when fetching a booking by ID', async () => {
      const errorMessage = 'Booking not found';
      bookingService.get.mockRejectedValue(new Error(errorMessage));

      await bookingController.fetch(req, res, jest.fn());

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 404);
    });
  });

  describe('change', () => {
    it('should update a booking', async () => {
      const booking = { id: faker.string.uuid() };
      bookingService.update.mockResolvedValue(booking);

      req.body = { status: 'Confirmed' };

      await bookingController.change(req, res, jest.fn());

      expect(bookingService.update).toHaveBeenCalledWith(req.body);
      expect(res.data).toEqual({
        message: 'Booking Updated Successfully',
        booking,
      });
      expect(res.statusCode).toEqual(200);
    });

    it('should handle errors when updating a booking', async () => {
      const errorMessage = 'Booking not found';
      bookingService.update.mockRejectedValue(new Error(errorMessage));

      await bookingController.change(req, res, jest.fn());

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 404);
    });
  });

  describe('remove', () => {
    it('should delete a booking by ID', async () => {
      req.params.id = faker.string.uuid();

      await bookingController.remove(req, res, jest.fn());

      expect(bookingService.remove).toHaveBeenCalledWith(req.params.id);
      expect(res.statusCode).toBe(204);
    });

    it('should handle errors when deleting a booking', async () => {
      const errorMessage = 'Booking not found';
      bookingService.remove.mockRejectedValue(new Error(errorMessage));

      await bookingController.remove(req, res, jest.fn());

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 404);
    });
  });

  describe('fetchReports', () => {
    it('should fetch booking reports', async () => {
      const reports = [{ date: '2024-01-01', count: 10 }];
      bookingService.getReports.mockResolvedValue(reports);

      req.query = { startDate: '2024-01-01', endDate: '2024-12-31' };

      await bookingController.fetchReports(req, res, jest.fn());

      expect(bookingService.getReports).toHaveBeenCalledWith(
        req.query.startDate,
        req.query.endDate,
      );
      expect(res.data).toEqual(reports);
      expect(res.statusCode).toEqual(200);
    });

    it('should handle errors when fetching reports', async () => {
      const errorMessage = 'Error fetching reports';
      bookingService.getReports.mockRejectedValue(new Error(errorMessage));

      await bookingController.fetchReports(req, res, jest.fn());

      // Ensure errorHandler is called with the correct arguments
      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('cancel', () => {
    it('should cancel a booking', async () => {
      const booking = { id: faker.string.uuid() };
      bookingService.cancel.mockResolvedValue(booking);

      req.params.id = faker.string.uuid();
      req.user = { id: faker.string.uuid() }; // Ensure you mock the user in req

      await bookingController.cancel(req, res, jest.fn());

      expect(bookingService.cancel).toHaveBeenCalledWith(
        req.params.id,
        req.user.id,
      );
      expect(res.data).toEqual({
        message: 'booking cancelled successfully',
        booking,
      });
      expect(res.statusCode).toEqual(200); // Ensure statusCode is set correctly
      expect(responseHandler).toHaveBeenCalledWith(req, res);
    });

    it('should handle errors when cancelling a booking', async () => {
      const errorMessage = 'Booking cancellation failed';
      bookingService.cancel.mockRejectedValue(new Error(errorMessage));

      await bookingController.cancel(req, res, jest.fn());

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });
});
