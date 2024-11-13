const { Movie, Theater, TheaterMovie, sequelize } = require('../models');
const { throwCustomError } = require('../helpers/common.helper');

exports.create = async (movieData, theaterIds) => {
  const transaction = await sequelize.transaction();

  try {
    const movie = await Movie.create(movieData, { transaction });

    if (theaterIds && theaterIds.length > 0) {
      const theaterAssociations = theaterIds.map(theaterId => ({
        movie_id: movie.id,
        theater_id: theaterId,
      }));
      console.log(theaterAssociations);

      await TheaterMovie.bulkCreate(theaterAssociations, { transaction });
    }

    await transaction.commit();

    const movieWithTheaters = await Movie.findByPk(movie.id, {
      include: {
        model: Theater,
        as: 'theaters',
        through: { attributes: [] },
      },
    });

    return movieWithTheaters;
  } catch (error) {
    await transaction.rollback();
    throwCustomError(error.message);
  }
};

exports.getAll = async () => await Movie.findAll();

exports.getMovieById = async movieId => {
  return await Movie.findByPk(movieId, {
    include: {
      model: Theater,
      as: 'theaters',
      through: { attributes: [] },
    },
  });
};

exports.update = async (movieId, movieData) => {
  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    throwCustomError('Movie not found', 404);
  }

  await movie.update(movieData);
  return movie;
};

exports.delete = async movieId => {
  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    throwCustomError('Movie not found', 404);
  }

  await movie.destroy();

  await TheaterMovie.update(
    { deleted_at: new Date() },
    { where: { movie_id: movieId }, individualHooks: true },
  );
  return { message: 'Movie soft deleted successfully' };
};

exports.getTheatersByMovie = async movieId => {
  const movie = await Movie.findByPk(movieId, {
    include: {
      model: Theater,
      as: 'theaters',
      through: { attributes: [] },
    },
  });

  if (!movie) {
    throwCustomError('Movie not found', 404);
  }

  return movie.theaters;
};
