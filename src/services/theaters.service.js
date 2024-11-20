const {
  Theater,
  Movie,
  TheaterMovie,
  Booking,
  Show,
  sequelize,
} = require('../models');
const { Sequelize } = require('sequelize');
const { throwCustomError } = require('../helpers/common.helper.js');
const create = async data => {
  const t = await sequelize.transaction();

  try {
    const theater = await Theater.create(data, { transaction: t });

    await t.commit();
    return theater;
  } catch (error) {
    await t.rollback();
    throwCustomError(error);
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
  const t = await sequelize.transaction();

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
  const t = await sequelize.transaction();

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

const getReports = async theaterId => {
  const whereClause = {};
  if (theaterId) {
    whereClause.id = theaterId;
  }

  const reports = await Theater.findAll({
    where: whereClause,
    attributes: [
      'id',
      'name',
      [Sequelize.fn('COUNT', Sequelize.col('shows.id')), 'totalBookings'],
      [
        Sequelize.fn('SUM', Sequelize.col('shows.bookings.total_amount')),
        'totalRevenue',
      ],
    ],
    include: [
      {
        model: Show,
        as: 'shows',
        attributes: [],
        include: [
          {
            model: Booking,
            as: 'bookings',
            attributes: [],
          },
        ],
      },
    ],
    group: ['Theater.id'],
    raw: true,
  });

  return reports.map(theater => ({
    theaterId: theater.id,
    theaterName: theater.name,
    totalBookings: theater.totalBookings,
    totalRevenue: parseFloat(theater.totalRevenue),
  }));
};
module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getMovies,
  getReports,
};
