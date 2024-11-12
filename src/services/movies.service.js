const { Movie } = require('../models');

exports.generate = async data => await Movie.create(data);

exports.getAll = async () => await Movie.findAll();

exports.getById = async id => {
  const movie = await Movie.findByPk(id);
  if (!movie) throwCustomError('Theater not found', 404);
  return movie;
};

exports.update = async (id, data) => {
  const movie = await Movie.findByPk(id);
  if (!movie) throwCustomError('Movie not found', 404);
  await movie.update(data);
  return movie;
};
