const bookingController = require('../../src/controllers/bookings.controller');
const bookingService = require('../../src/services/bookings.service');
const { Booking } = require('../../src/models');
const { errorHandler } = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');

// Mock dependencies
jest.mock('../../src/services/bookings.service');
jest.mock('../../src/models', () => ({
  Booking: {
    findOne: jest.fn(),
  },
}));
jest.mock('../../src/helpers/common.helper');

describe('Booking Controller', () => {
  let req, res, next;

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
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('generate', () => {
    it('should create a booking successfully', async () => {
      const bookingData = { id: faker.string.uuid(), status: 'Confirmed' };
      bookingService.create.mockResolvedValue(bookingData);

      req.body = { showId: faker.string.uuid() };

      await bookingController.generate(req, res, next);

      expect(bookingService.create).toHaveBeenCalledWith(req.user.id, req.body);
      expect(res.data).toEqual(bookingData);
      expect(res.statusCode).toBe(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during booking creation', async () => {
      const errorMessage = 'Error creating booking';
      const error = new Error(errorMessage); // Create an error instance
      bookingService.create.mockRejectedValue(error);

      await bookingController.generate(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, error, 400); // Pass the error instance
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('fetchAll', () => {
    it('should fetch all bookings successfully', async () => {
      const bookings = [{ id: faker.string.uuid() }];
      bookingService.getAll.mockResolvedValue(bookings);

      req.query = { page: 1, limit: 10 };

      await bookingController.fetchAll(req, res, next);

      expect(bookingService.getAll).toHaveBeenCalledWith({}, 1, 10);
      expect(res.data).toEqual(bookings);
      expect(res.message).toBe('Bookings fetched successfully!');
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when fetching bookings', async () => {
      const errorMessage = 'Booking not found';
      bookingService.getAll.mockRejectedValue(new Error(errorMessage));

      await bookingController.fetchAll(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        'Booking not found',
        404,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('fetch', () => {
    it('should fetch a booking by ID successfully', async () => {
      const booking = { id: faker.string.uuid() };
      bookingService.get.mockResolvedValue(booking);

      req.params.id = faker.string.uuid();

      await bookingController.fetch(req, res, next);

      expect(bookingService.get).toHaveBeenCalledWith(req.params.id);
      expect(res.data).toEqual({ booking });
      expect(res.message).toBe('Booking fetched by id successfully!');
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when fetching a booking by ID', async () => {
      const errorMessage = 'Booking not found';
      const error = new Error(errorMessage); // Create an error instance
      bookingService.get.mockRejectedValue(error);

      await bookingController.fetch(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, error, 404); // Pass the error instance
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('change', () => {
    it('should update a booking if the user is authorized', async () => {
      const bookingData = { id: faker.string.uuid(), user_id: req.user.id };
      const updatedBooking = { id: bookingData.id, status: 'Confirmed' };

      Booking.findOne.mockResolvedValue(bookingData);
      bookingService.update.mockResolvedValue(updatedBooking);

      req.params.id = bookingData.id;
      req.body = { status: 'Confirmed' };

      await bookingController.change(req, res, next);

      expect(Booking.findOne).toHaveBeenCalledWith({
        where: { id: req.params.id },
      });
      expect(bookingService.update).toHaveBeenCalledWith(
        req.params.id,
        req.body,
      );
      expect(res.data).toEqual(updatedBooking);
      expect(res.message).toBe('Booking Updated Successfully');
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when updating a booking', async () => {
      const errorMessage = new Error('Booking not found'); // Use an Error object.

      Booking.findOne.mockRejectedValue(errorMessage); // Simulate a failed database call.

      await bookingController.change(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 404); // Expect the Error object.
      expect(next).not.toHaveBeenCalled(); // Ensure middleware is not called after an error.
    });
  });

  describe('remove', () => {
    it('should delete a booking successfully', async () => {
      req.params.id = faker.string.uuid();

      await bookingController.remove(req, res, next);

      expect(bookingService.remove).toHaveBeenCalledWith(req.params.id);
      expect(res.message).toBe('Booking deleted successfully!');
      expect(res.statusCode).toBe(204);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when deleting a booking', async () => {
      const errorMessage = new Error('Booking not found'); // Use an Error object.

      bookingService.remove.mockRejectedValue(errorMessage); // Simulate an error during deletion.

      await bookingController.remove(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 404); // Expect the Error object.
      expect(next).not.toHaveBeenCalled(); // Ensure the middleware chain is not called.
    });
  });

  describe('fetchReports', () => {
    it('should fetch booking reports successfully', async () => {
      const reports = [{ date: '2024-01-01', count: 10 }];
      bookingService.getReports.mockResolvedValue(reports);

      req.query = { startDate: '2024-01-01', endDate: '2024-12-31' };

      await bookingController.fetchReports(req, res, next);

      expect(bookingService.getReports).toHaveBeenCalledWith(
        req.query.startDate,
        req.query.endDate,
      );
      expect(res.data).toEqual(reports);
      expect(res.message).toBe('Report fetched successfully!');
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when fetching reports', async () => {
      const errorMessage = new Error('Error fetching reports');
      errorMessage.statusCode = 400; // Simulate an error with a status code.

      bookingService.getReports.mockRejectedValue(errorMessage); // Simulate service rejection.

      await bookingController.fetchReports(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400); // Expect the error object and status code.
      expect(next).not.toHaveBeenCalled(); // Ensure middleware chain is not called.
    });
  });
});
