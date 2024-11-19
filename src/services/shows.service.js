const { Show, Movie, Theater, sequelize } = require('../models');
const { Op } = require('sequelize');

const create = async data => {
  const t = await sequelize.transaction();

  try {
    const show = await Show.create(data, { transaction: t });
    await t.commit();
    return show;
  } catch (error) {
    await t.rollback();
    throwCustomError(error);
  }
};

const getAll = async (filters, page = 1, limit = 10) => {
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

const getById = async id => {
  const show = Show.findByPk(id);
  if (!show) {
    throwCustomError('Show not available for that id', 404);
  }
  return show;
};

const update = async (id, data) => {
  const transaction = await sequelize.transaction();

  try {
    const show = await Show.findByPk(id, { transaction });

    if (!show) {
      throwCustomError('Show not available for that id', 404);
    }
    await show.update(data, { transaction });

    await transaction.commit();

    return show;
  } catch (error) {
    await transaction.rollback();
    throwCustomError(error);
  }
};

const remove = async id => {
  const t = await sequelize.transaction();

  try {
    const show = await Show.findByPk(id, { transaction: t });
    if (!show) {
      throwCustomError('Show with that id does not exist', 404);
    }

    await show.destroy({ transaction: t });

    await t.commit();

    return { message: 'Show successfully deleted' };
  } catch (error) {
    await t.rollback();
    throwCustomError(error);
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};
