const bookingService = require('../services/bookings.service');
const { errorHandler, responseHandler } = require('../helpers/common.helper');

const generate = async (req, res) => {
  try {
    const booking = await bookingService.create(req.body);
    res.data = booking;
    res.statusCode = 201;
    responseHandler(req, res);
  } catch (error) {
    console.error(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchAll = async (req, res) => {
  const { page = 1, limit = 10, ...filters } = req.query;

  try {
    const result = await bookingService.getAll(filters, page, limit);

    res.data = result;
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    console.error(error);

    if (error.statusCode) {
      errorHandler(req, res, error.message, error.statusCode);
    } else {
      errorHandler(req, res, 'Booking not found', 404);
    }
  }
};

const fetchById = async (req, res) => {
  try {
    const booking = await bookingService.getById(req.params.id);
    res.data = { message: 'Fetched Booking By Id', booking };
    (res.statusCode = 200), responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, 404);
  }
};

const change = async (req, res) => {
  try {
    const booking = await bookingService.update(req.body);
    res.data = {
      message: 'Booking Updated Successfully',
      booking,
    };
    (res.statusCode = 200), responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, 404);
  }
};

const remove = async (req, res) => {
  try {
    await bookingService.remove(req.params.id);
    res.data = {
      message: 'Booking deleted successfully!',
    };
    res.statusCode = 204;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, 404);
  }
};

const fetchReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await bookingService.getReports(startDate, endDate);
    res.data = data;
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  generate,
  fetchAll,
  fetchById,
  change,
  remove,
  fetchReports,
};
