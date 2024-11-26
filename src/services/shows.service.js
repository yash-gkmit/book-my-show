const { Show, Movie, Theater, sequelize } = require('../models');
const { Op } = require('sequelize');
const { throwCustomError } = require('../helpers/common.helper');

const create = async payload => {
  const t = await sequelize.transaction();

  try {
    const showData = {
      movie_id: payload.movieId,
      theater_id: payload.theaterId,
      show_time: payload.showTime,
      available_seats: payload.availableSeats,
      type: payload.type,
      price: payload.price,
    };
    const show = await Show.create(showData, { transaction: t });
    await t.commit();
    return show;
  } catch (error) {
    await t.rollback();
    throwCustomError(error);
  }
};

const getAll = async payload => {
  const { page = 1, limit = 10, ...filters } = payload;
  const offset = (page - 1) * limit;

  const whereConditions = {};

  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Show.rawAttributes).includes(key)) {
      whereConditions[key] = { [Op.eq]: value };
    }
  }

  const result = await Show.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: Movie,
        as: 'movie',
      },
      {
        model: Theater,
        as: 'theater',
      },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return {
    data: result.rows,
    pagination: {
      totalItems: result.count,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(result.count / limit),
    },
  };
};

const get = async payload => {
  const show = await Show.findByPk(payload);
  if (!show) {
    throwCustomError('show not available for that id', 404);
  }
  return show;
};

const update = async payload => {
  const { id } = payload.id;
  const data = payload.data;

  console.log(id, data);
  const transaction = await sequelize.transaction();

  try {
    const show = await Show.findByPk(id, { transaction });

    if (!show) {
      throwCustomError('show not available for that id', 404);
    }
    await show.update(data, { transaction });

    await transaction.commit();

    return show;
  } catch (error) {
    await transaction.rollback();
    throwCustomError(error);
  }
};

const remove = async payload => {
  const t = await sequelize.transaction();
  const id = payload;
  console.log(id);
  try {
    const show = await Show.findByPk(id, { transaction: t });
    if (!show) {
      throwCustomError('show with that id does not exist', 404);
    }

    await show.destroy({ transaction: t });

    await t.commit();

    return { message: 'show successfully deleted' };
  } catch (error) {
    await t.rollback();
    throwCustomError(error);
  }
};

module.exports = {
  create,
  getAll,
  get,
  update,
  remove,
};
