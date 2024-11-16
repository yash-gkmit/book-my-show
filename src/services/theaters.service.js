const { Theater, Movie, TheaterMovie } = require('../models');
const { throwCustomError } = require('../helpers/common.helper.js');
const create = async data => {
  const t = await Sequelize.transaction();

  try {
    const theater = await Theater.create(data, { transaction: t });

    await t.commit();
    return theater;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
const getAll = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { rows: theaters, count: totalTheaters } =
    await Theater.findAndCountAll({
      limit,
      offset,
    });

  return {
    data: theaters,
    pagination: {
      totalItems: totalTheaters,
      currentPage: parseInt(page, 10),
      itemsPerPage: parseInt(limit, 10),
      totalPages: Math.ceil(totalTheaters / limit),
    },
  };
};

const getById = async id => {
  const theater = await Theater.findByPk(id);
  if (!theater) throwCustomError('Theater not found', 404);
  return theater;
};

const update = async (id, data) => {
  const t = await Sequelize.transaction();

  try {
    const theater = await Theater.findByPk(id, { transaction: t });
    if (!theater) throwCustomError('Theater not found', 404);
    await theater.update(data, { transaction: t });
    await t.commit();
    return theater;
  } catch (error) {
    await t.rollback();
    throw new Error('Error updating the theater: ' + error.message);
  }
};

const remove = async id => {
  const t = await Sequelize.transaction();

  try {
    const theater = await Theater.findByPk(id, { transaction: t });
    if (!theater) throwCustomError('Theater not found', 404);

    await theater.destroy({ transaction: t });

    await t.commit();
  } catch (error) {
    await t.rollback();

    throw new Error('Error removing the theater: ' + error.message);
  }
};

const getByCity = async (cityId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  try {
    const theaters = await Theater.findAndCountAll({
      where: { city_id: cityId },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      data: theaters.rows,
      pagination: {
        totalItems: theaters.count,
        currentPage: parseInt(page, 10),
        itemsPerPage: parseInt(limit, 10),
        totalPages: Math.ceil(theaters.count / limit),
      },
    };
  } catch (error) {
    throw new Error(
      `Error retrieving theaters for city ${cityId}: ${error.message}`,
    );
  }
};

const getMovies = async (theaterId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const theater = await Theater.findByPk(theaterId);

  if (!theater) {
    throw new Error(`Theater with ID ${theaterId} not found`);
  }

  const { count: totalMovies } = await TheaterMovie.findAndCountAll({
    where: { theater_id: theaterId },
  });

  const theaterMovies = await TheaterMovie.findAll({
    where: { theater_id: theaterId },
    include: [
      {
        model: Movie,
        as: 'movie',
        required: true,
      },
    ],
    limit,
    offset,
  });

  const movies = theaterMovies.map(theaterMovie => theaterMovie.movie);

  return {
    data: movies,
    pagination: {
      totalItems: totalMovies,
      currentPage: parseInt(page, 10),
      itemsPerPage: parseInt(limit, 10),
      totalPages: Math.ceil(totalMovies / limit),
    },
  };
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getByCity,
  getMovies,
};
