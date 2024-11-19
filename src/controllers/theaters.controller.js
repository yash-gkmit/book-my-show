const theaterService = require('../services/theaters.service');
const {
  responseHandler,
  errorHandler,
  throwCustomError,
} = require('../helpers/common.helper');

const generate = async (req, res) => {
  try {
    const theater = await theaterService.create(req.body);
    res.data = theater;
    res.statusCode = 201;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchAll = async (req, res) => {
  try {
    const theaters = await theaterService.getAll();
    res.data = theaters;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchById = async (req, res) => {
  try {
    const theater = await theaterService.getById(req.params.id);
    res.data = theater;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const change = async (req, res) => {
  try {
    const theater = await theaterService.update(req.params.id, req.body);
    res.data = theater;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const remove = async (req, res) => {
  try {
    await theaterService.remove(req.params.id);
    res.statusCode = 204;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchByCity = async (req, res) => {
  const { city_id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const theaters = await theaterService.getByCity(city_id, page, limit);

    if (!theaters.data.length) {
      return res
        .status(404)
        .json({ message: 'No theaters found for the specified city.' });
    }

    res.data = {
      message: 'Theater fetched by city successfully!',
      theaters,
    };
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 404);
  }
};

const fetchMovies = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const movies = await theaterService.getMovies(id, page, limit);

    if (!movies || movies.data.length === 0) {
      throwCustomError('No movies found for the specified theater.', 404);
    }

    res.data = movies;
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    console.error(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchReports = async (req, res) => {
  try {
    const { theaterId } = req.query;
    const data = await theaterService.getReports(theaterId);
    res.data = data;
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

module.exports = {
  generate,
  fetchAll,
  fetchById,
  remove,
  change,
  fetchByCity,
  fetchMovies,
  fetchReports,
};
