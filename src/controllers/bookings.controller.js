const bookingService = require('../services/bookings.service');
const { Booking } = require('../models');
const { errorHandler, throwCustomError } = require('../helpers/common.helper');

const generate = async (req, res, next) => {
  try {
    const booking = await bookingService.create(req.user.id, req.body);
    res.message = 'Booking created successfully!';
    res.data = booking;
    res.statusCode = 201;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const fetchAll = async (req, res, next) => {
  const { page = 1, limit = 10, ...filters } = req.query;

  try {
    const result = await bookingService.getAll(filters, page, limit);

    res.data = result;
    res.message = 'Bookings fetched successfully!';
    res.statusCode = 200;
    next();
  } catch (error) {
    if (error.statusCode) {
      errorHandler(req, res, error, error.statusCode);
    } else {
      errorHandler(req, res, 'Booking not found', 404);
    }
  }
};

const fetch = async (req, res, next) => {
  try {
    const booking = await bookingService.get(req.params.id);
    res.message = 'Booking fetched by id successfully!';
    res.data = booking;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, 404);
  }
};

const change = async (req, res, next) => {
  try {
    const bookingData = await Booking.findOne({
      where: { id: req.params.id },
    });

    if (req.user.id !== bookingData.user_id) {
      throwCustomError('you are not authorized to update this booking!');
    }
    const booking = await bookingService.update(req.params.id, req.body);
    res.message = 'Booking Updated Successfully';
    res.data = booking;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error, 404);
  }
};

const remove = async (req, res, next) => {
  try {
    await bookingService.remove(req.params.id);
    res.message = 'Booking deleted successfully!';
    res.statusCode = 204;
    next();
  } catch (error) {
    errorHandler(req, res, error, 404);
  }
};

const fetchReports = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await bookingService.getReports(startDate, endDate);
    res.message = 'Report fetched successfully!';
    res.data = data;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode);
  }
};

module.exports = {
  generate,
  fetchAll,
  fetch,
  change,
  remove,
  fetchReports,
};
