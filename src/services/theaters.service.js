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

  const t = await sequelize.transaction();
  try {
    const isAddressExist = await Theater.findOne({
      where: { address: data.address },
    });

    if (isAddressExist) {
      throwCustomError('can not add theater with same address!', 400);
    }
    const theater = await Theater.create(data, { transaction: t });
    await t.commit();
    return theater;
  } catch (error) {
    await t.rollback();
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
  if (!theater) throwCustomError('theater not found with that id!', 404);
  return theater;
};

const update = async payload => {
  const t = await sequelize.transaction();

  const { id } = payload.id;
  const data = payload.data;

  try {
    const theater = await Theater.findByPk(id, { transaction: t });
    if (!theater) throwCustomError('theater not found with that id!', 404);
    await theater.update(data, { transaction: t });
    await t.commit();
    return theater;
  } catch (error) {
    await t.rollback();
    throwCustomError(`rrror updating the theater: ${error}`, 400);
  }
};

const remove = async payload => {
  const t = await sequelize.transaction();
  const { id } = payload;

  try {
    const theater = await Theater.findByPk(id, { transaction: t });
    if (!theater) throwCustomError('theater not found', 404);

    await theater.destroy({ transaction: t });

    await t.commit();
    return { message: 'theater deleted successfully!' };
  } catch (error) {
    await t.rollback();

    throwCustomError(`error removing the theater: ${error}`, 400);
  }
};

const getMovies = async (theaterId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const theater = await Theater.findByPk(theaterId);

  if (!theater) {
    throwCustomError(`theater with ID ${theaterId} not found`, 404);
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
  getReports,
};
