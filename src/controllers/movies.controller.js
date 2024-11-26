const movieService = require('../services/movies.service');
const { uploadOnS3 } = require('../helpers/s3.helper');
const { errorHandler } = require('../helpers/common.helper');
const path = require('path');
const fs = require('fs');

const create = async (req, res, next) => {
  try {
    const posterUrl = await uploadOnS3(req.files.poster[0], 'poster');
    const trailerUrl = await uploadOnS3(req.files.trailer[0], 'trailer');

    const { theaterIds, ...movieData } = req.body;
    movieData.poster = posterUrl;
    movieData.trailer = trailerUrl;

    movieData.poster = posterUrl;
    movieData.trailer = trailerUrl;

    const movie = await movieService.create(theaterIds, movieData);

    res.message = 'Movie created successfully!';
    res.data = movie;
    res.statusCode = 201;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { query } = req;
    const movies = await movieService.getAll(query);

    if (!movies.data.length) {
      return errorHandler(req, res, 'No movies found', 404);
    }
    res.message = 'Movies fetched successfully';
    res.data = movies;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const get = async (req, res, next) => {
  const payload = req.params;
  try {
    const movie = await movieService.get(payload);
    if (!movie) {
      return errorHandler(req, res, 'Movie not found', 404);
    }

    res.data = movie;
    res.message = 'Movie fetched successfully!';
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const update = async (req, res, next) => {
  const payload = {
    id: req.params,
    body: req.body,
  };
  try {
    const movie = await movieService.update(payload);
    res.message = 'Movie updated successfully';
    res.data = movie;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};
const remove = async (req, res, next) => {
  const payload = req.params;

  try {
    await movieService.remove(payload);
    res.message = 'Movie deleted successfully';
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const getTheatersByMovieId = async (req, res, next) => {
  const payload = req.params;

  try {
    const theaters = await movieService.getTheatersByMovieId(payload);
    if (!theaters.length) {
      return errorHandler(req, res, 'No theaters found for this movie', 404);
    }

    res.message = 'Movie fetched by theater successfully!';
    res.data = theaters;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const getReport = async (req, res) => {
  const payload = req.query;

  try {
    const filePath = await movieService.getReport(payload);

    if (!filePath) {
      throwCustomError('Report generation failed', 422);
    }

    if (!fs.existsSync(filePath)) {
      throwCustomError('Report file not found', 404);
    }

    res.download(filePath, path.basename(filePath), err => {
      if (err) {
        console.error('Error sending file:', err);
        return errorHandler(req, res, 'Failed to download report', 424);
      }
    });
  } catch (error) {
    console.error('Error in fetchReport:', error.stack);
    errorHandler(req, res, error, error.statusCode || 400);
  }
};
module.exports = {
  create,
  getAll,
  get,
  update,
  remove,
  getTheatersByMovieId,
  getReport,
};
