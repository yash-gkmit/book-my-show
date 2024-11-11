const theaterService = require('../services/theaters.service');
const { responseHandler, errorHandler } = require('../helpers/common.helper');

exports.generate = async (req, res) => {
  try {
    const theater = await theaterService.create(req.body);
    res.data = theater;
    console.log(res.data);
    res.statusCode = 201;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};
