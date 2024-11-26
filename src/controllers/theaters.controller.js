const theaterService = require('../services/theaters.service');
const { errorHandler, throwCustomError } = require('../helpers/common.helper');

const create = async (req, res, next) => {
  const data = req.body;
  try {
    const theater = await theaterService.create(data);
    res.message = 'Theaters created successfully!';
    res.data = theater;
    res.statusCode = 201;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const getAll = async (req, res, next) => {
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

const get = async (req, res, next) => {
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

const update = async (req, res, next) => {
  const payload = {
    id: req.params,
    data: req.body,
  };

  try {
    const theater = await theaterService.update(payload);
    res.data = theater;
    res.message = 'Theater updated successfully!';
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

const getMovies = async (req, res, next) => {
  const payload = {
    id: req.params,
    query: req.query,
  };

  try {
    const movies = await theaterService.getMovies(payload);

    if (!movies || movies.data.length === 0) {
      throwCustomError('No movies found for the specified theater.', 404);
    }

    res.data = movies;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const getReport = async (req, res, next) => {
  const payload = req.query;
  try {
    const data = await theaterService.getReport(payload);
    res.data = data;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

module.exports = {
  create,
  getAll,
  get,
  remove,
  update,
  getMovies,
  getReport,
};
