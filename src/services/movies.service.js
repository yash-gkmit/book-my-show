const { Movie } = require('../models');

exports.generate = async data => await Movie.create(data);

exports.getAll = async () => await Movie.findAll();
