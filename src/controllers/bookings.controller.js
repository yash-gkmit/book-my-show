const bookingService = require('../services/bookings.service');
const { Booking } = require('../models');
const { errorHandler, throwCustomError } = require('../helpers/common.helper');

const create = async (req, res, next) => {
  const payload = {
    id: req.user,
    body: req.body,
  };
  try {
    const booking = await bookingService.create(payload);
    res.message = 'Booking created successfully!';
    res.data = booking;
    res.statusCode = 201;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const getAll = async (req, res, next) => {
  const filters = req.query;

  try {
    const result = await bookingService.getAll(filters);

    res.data = result;
    res.message = 'Bookings fetched successfully!';
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const get = async (req, res, next) => {
  const payload = req.params;
  try {
    const booking = await bookingService.get(payload);
    res.message = 'Booking fetched by id successfully!';
    res.data = booking;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 404);
  }
};

const update = async (req, res, next) => {
  const payload = {
    id: req.params.id,
    body: req.body,
  };
  try {
    const bookingData = await Booking.findOne({
      where: { id: req.params.id },
    });

    if (!bookingData) {
      throwCustomError('Booking not found', 404);
    }

    if (req.user.id !== bookingData.user_id) {
      throwCustomError('You are not authorized to update this booking!', 403);
    }
    const booking = await bookingService.update(payload);
    res.message = 'Booking updated successfully';
    res.data = booking;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, 404);
  }
};

const remove = async (req, res, next) => {
  const payload = req.params;
  try {
    await bookingService.remove(payload);
    res.message = 'Booking deleted successfully!';
    res.statusCode = 204;
    next();
  } catch (error) {
    errorHandler(req, res, error, 404);
  }
};

const getReport = async (req, res, next) => {
  try {
    const data = await bookingService.getReport();
    res.message = 'Report fetched successfully!';
    res.data = data;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode);
  }
};

module.exports = {
  create,
  getAll,
  get,
  update,
  remove,
  getReport,
};
