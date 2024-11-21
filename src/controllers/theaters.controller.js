const theaterService = require('../services/theaters.service');
const { errorHandler, throwCustomError } = require('../helpers/common.helper');

const generate = async (req, res, next) => {
  try {
    const theater = await theaterService.create(req.body);
    res.message = 'Theaters created successfully!';
    res.data = theater;
    res.statusCode = 201;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchAll = async (req, res, next) => {
  try {
    const theaters = await theaterService.getAll();
    res.data = theaters;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetch = async (req, res, next) => {
  try {
    const theater = await theaterService.get(req.params.id);
    res.data = theater;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const change = async (req, res, next) => {
  try {
    const theater = await theaterService.update(req.params.id, req.body);
    res.data = theater;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const remove = async (req, res, next) => {
  try {
    await theaterService.remove(req.params.id);
    res.statusCode = 204;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchMovies = async (req, res, next) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const movies = await theaterService.getMovies(id, page, limit);

    if (!movies || movies.data.length === 0) {
      throwCustomError('No movies found for the specified theater.', 404);
    }

    res.data = movies;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.error(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchReports = async (req, res, next) => {
  try {
    const { theaterId } = req.query;
    const data = await theaterService.getReports(theaterId);
    res.data = data;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

module.exports = {
  generate,
  fetchAll,
  fetch,
  remove,
  change,
  fetchMovies,
  fetchReports,
};
