const movieService = require('../services/movies.service');
const { uploadOnS3 } = require('../helpers/s3.helper');
const { errorHandler, responseHandler } = require('../helpers/common.helper');

exports.create = async (req, res) => {
  try {
    const posterUrl = await uploadOnS3(req.files.poster[0], 'poster');
    const trailerUrl = await uploadOnS3(req.files.trailer[0], 'trailer');
    const movieData = { ...req.body, poster: posterUrl, trailer: trailerUrl };
    const movie = await movieService.generate(movieData);
    res.data = movie;
    res.statusCode = 201;
    responseHandler(req, res);
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

exports.fetchAll = async (req, res) => {
  try {
    const movies = await movieService.getAll();
    res.status(200).json(movies);
  } catch (error) {
    errorHandler(res, error.message, error.statusCode || 400);
  }
};
