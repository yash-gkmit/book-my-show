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

exports.fetchAll = async (req, res) => {
  try {
    const theaters = await theaterService.getAll();
    res.data = theaters;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

exports.fetchById = async (req, res) => {
  try {
    const theater = await theaterService.getById(req.params.id);
    res.data = theater;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

exports.change = async (req, res) => {
  try {
    const theater = await theaterService.update(req.params.id, req.body);
    res.data = theater;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);

    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

exports.remove = async (req, res) => {
  try {
    await theaterService.delete(req.params.id);
    res.statusCode = 204;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};
