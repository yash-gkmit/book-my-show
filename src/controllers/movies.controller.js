const movieService = require('../services/movies.service');
const { uploadOnS3 } = require('../helpers/s3.helper');
const { errorHandler, responseHandler } = require('../helpers/common.helper');

exports.generate = async (req, res) => {
  try {
    const posterUrl = await uploadOnS3(req.files.poster[0], 'poster');
    const trailerUrl = await uploadOnS3(req.files.trailer[0], 'trailer');

    const { theaterIds, ...movieData } = req.body;
    movieData.poster = posterUrl;
    movieData.trailer = trailerUrl;

    const movie = await movieService.create(movieData, theaterIds);

    res.data = {
      message: 'Movie created successfully',
      movie: {
        ...movie.toJSON(),
        theaters: movie.theaters || [],
      },
    };
    res.statusCode = 201;
    responseHandler(req, res);
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

exports.fetchAll = async (req, res) => {
  try {
    const movies = await movieService.getAll();
    if (!movies.length) {
      return errorHandler(req, res, 'No movies found', 404);
    }

    res.data = movies;
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

exports.fetchById = async (req, res) => {
  try {
    const movie = await movieService.getMovieById(req.params.id);
    if (!movie) {
      return errorHandler(req, res, 'Movie not found', 404);
    }

    res.data = movie;
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

exports.change = async (req, res) => {
  try {
    const updatedMovie = await movieService.update(req.params.id, req.body);
    res.data = {
      message: 'Movie updated successfully',
      movie: updatedMovie,
    };
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

exports.remove = async (req, res) => {
  try {
    await movieService.delete(req.params.id);
    res.data = { message: 'Movie Soft deleted successfully' };
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

exports.getTheatersByMovieId = async (req, res) => {
  try {
    const theaters = await movieService.getTheatersByMovie(req.params.id);
    if (!theaters.length) {
      return errorHandler(req, res, 'No theaters found for this movie', 404);
    }

    res.data = theaters;
    res.statusCode = 200;
    responseHandler(req, res);
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};
