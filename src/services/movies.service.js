const { Movie } = require('../models');

exports.generate = async data => await Movie.create(data);
