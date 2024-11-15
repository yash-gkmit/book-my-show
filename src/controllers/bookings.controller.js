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

module.exports = {
  generate,
};
