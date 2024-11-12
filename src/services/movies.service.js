const { Movie } = require('../models');

exports.generate = async data => await Movie.create(data);

exports.getAll = async () => await Movie.findAll();

exports.getById = async id => {
  const movie = await Movie.findByPk(id);
  if (!movie) throwCustomError('Theater not found', 404);
  return movie;
};
