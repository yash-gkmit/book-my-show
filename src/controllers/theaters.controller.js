const theaterService = require('../services/theaters.service');
const { errorHandler, throwCustomError } = require('../helpers/common.helper');

const generate = async (req, res, next) => {
  const data = req.body;
  try {
    const theater = await theaterService.create(data);
    res.message = 'theaters created successfully!';
    res.data = theater;
    res.statusCode = 201;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const fetchAll = async (req, res, next) => {
  const filters = req.query;
  try {
    const theaters = await theaterService.getAll(filters);
    res.data = theaters;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const fetch = async (req, res, next) => {
  const id = req.params;

  try {
    const theater = await theaterService.get(id);
    res.data = theater;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const change = async (req, res, next) => {
  const payload = {
    id: req.params,
    data: req.body,
  };

  try {
    const theater = await theaterService.update(payload);
    res.data = theater;
    res.message = 'theater updated successfully!';
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const remove = async (req, res, next) => {
  const id = req.params;

  try {
    await theaterService.remove(id);
    res.statusCode = 204;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const fetchMovies = async (req, res, next) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const movies = await theaterService.getMovies(id, page, limit);

    if (!movies || movies.data.length === 0) {
      throwCustomError('no movies found for the specified theater.', 404);
    }

    res.data = movies;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
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
    errorHandler(req, res, error, error.statusCode || 400);
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
