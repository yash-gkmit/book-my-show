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

const create = async payload => {
  const data = {
    city_id: payload.cityId,
    name: payload.name,
    address: payload.address,
  };

  try {
    const isAddressExist = await Theater.findOne({
      where: { address: data.address },
    });

    if (isAddressExist) {
      throwCustomError('Can not add theater with same address!', 400);
    }
    const theater = await Theater.create(data);
    return theater;
  } catch (error) {
    throwCustomError(error);
  }
};

const getAll = async payload => {
  const { page = 1, limit = 10 } = payload;
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

const get = async payload => {
  const id = payload.id;
  const theater = await Theater.findByPk(id);
  if (!theater) throwCustomError('Theater not found with that id!', 404);
  return theater;
};

const update = async payload => {
  const { id } = payload.id;
  const data = payload.data;

  const theater = await Theater.findByPk(id);
  if (!theater) throwCustomError('Theater not found with that id!', 404);
  await theater.update(data);
  return theater;
};

const remove = async payload => {
  const { id } = payload;

  const theater = await Theater.findByPk(id);
  if (!theater) throwCustomError('Theater not found', 404);

  await theater.destroy();
  return { message: 'Theater deleted successfully!' };
};

const getMovies = async payload => {
  const { id } = payload.id;
  const { page = 1, limit = 10 } = payload.query;

  const offset = (page - 1) * limit;

  const theater = await Theater.findByPk(id);

  if (!theater) {
    throwCustomError(`Theater with ID ${id} not found`, 404);
  }

  const { count: totalMovies } = await TheaterMovie.findAndCountAll({
    where: { theater_id: id },
  });

  const theaterMovies = await TheaterMovie.findAll({
    where: { theater_id: id },
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

const getReport = async payload => {
  const { id } = payload;
  const whereClause = {};
  if (id) {
    whereClause.id = id;
  }

  const reports = await Theater.findAll({
    where: whereClause,
    attributes: [
      'id',
      'name',
      [
        sequelize.cast(
          sequelize.fn('COUNT', sequelize.col('shows.id')),
          'integer',
        ),
        'totalBookings',
      ],
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
  get,
  update,
  remove,
  getMovies,
  getReport,
};
