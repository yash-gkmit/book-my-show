const movieService = require('../services/movies.service');
const { uploadOnS3 } = require('../helpers/s3.helper');
const { errorHandler } = require('../helpers/common.helper');
const path = require('path');
const fs = require('fs');

const generate = async (req, res, next) => {
  try {
    const posterUrl = await uploadOnS3(req.files.poster[0], 'poster');
    const trailerUrl = await uploadOnS3(req.files.trailer[0], 'trailer');

    const { theaterIds, ...movieData } = req.body;
    movieData.poster = posterUrl;
    movieData.trailer = trailerUrl;

    const movie = await movieService.create(movieData, theaterIds);

    res.message = 'Movie created successfully!';
    res.data = {
      movie: {
        ...movie?.toJSON(),
      },
    };
    res.statusCode = 201;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchAll = async (req, res, next) => {
  try {
    const { query } = req;
    const movies = await movieService.getAll(query);

    if (!movies.data.length) {
      return errorHandler(req, res, 'No movies found', 404);
    }

    res.data = {
      message: 'Movies fetched successfully',
      currentPage: movies.currentPage,
      totalPages: movies.totalPages,
      totalRecords: movies.totalRecords,
      movies: movies.data,
    };
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetch = async (req, res, next) => {
  try {
    const movie = await movieService.get(req.params.id);
    if (!movie) {
      return errorHandler(req, res, 'Movie not found', 404);
    }

    res.data = movie;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const change = async (req, res, next) => {
  try {
    const updatedMovie = await movieService.update(req.params.id, req.body);
    res.data = {
      message: 'Movie updated successfully',
      movie: updatedMovie,
    };
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};
const remove = async (req, res, next) => {
  try {
    await movieService.remove(req.params.id);
    res.data = { message: 'Movie Soft deleted successfully' };
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const getTheatersByMovieId = async (req, res, next) => {
  try {
    const theaters = await movieService.getTheatersByMovie(req.params.id);
    if (!theaters.length) {
      return errorHandler(req, res, 'No theaters found for this movie', 404);
    }

    res.data = theaters;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const filePath = await movieService.generateReport(startDate, endDate);

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
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};
module.exports = {
  generate,
  fetchAll,
  fetch,
  change,
  remove,
  getTheatersByMovieId,
  fetchReport,
};
