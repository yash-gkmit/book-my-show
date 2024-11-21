const bookingService = require('../services/bookings.service');
const { errorHandler } = require('../helpers/common.helper');

const generate = async (req, res, next) => {
  try {
    const booking = await bookingService.create(req.body);
    res.data = booking;
    res.statusCode = 201;
    next();
  } catch (error) {
    console.error(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchAll = async (req, res, next) => {
  const { page = 1, limit = 10, ...filters } = req.query;

  try {
    const result = await bookingService.getAll(filters, page, limit);

    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.error(error);

    if (error.statusCode) {
      errorHandler(req, res, error.message, error.statusCode);
    } else {
      errorHandler(req, res, 'Booking not found', 404);
    }
  }
};

const fetchById = async (req, res, next) => {
  try {
    const booking = await bookingService.getById(req.params.id);
    res.data = { message: 'Fetched Booking By Id', booking };
    (res.statusCode = 200), next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, 404);
  }
};

const change = async (req, res, next) => {
  try {
    const booking = await bookingService.update(req.body);
    res.data = {
      message: 'Booking Updated Successfully',
      booking,
    };
    (res.statusCode = 200), next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, 404);
  }
};

const remove = async (req, res, next) => {
  try {
    await bookingService.remove(req.params.id);
    res.data = {
      message: 'Booking deleted successfully!',
    };
    res.statusCode = 204;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, 404);
  }
};

const fetchReports = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await bookingService.getReports(startDate, endDate);
    res.data = data;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode);
  }
};

const cancel = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const booking = await bookingService.cancel(id, userId);
    res.data = {
      message: 'booking cancelled successfully',
      booking,
    };
    res.status = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, 400);
  }
};

module.exports = {
  generate,
  fetchAll,
  fetchById,
  change,
  remove,
  fetchReports,
  cancel,
};
