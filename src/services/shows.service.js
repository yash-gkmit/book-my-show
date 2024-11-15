const { Show, Movie, Theater, sequelize } = require('../models');

const create = async data => {
  const t = await sequelize.transaction();

  try {
    const show = await Show.create(data, { transaction: t });
    await t.commit();
    return show;
  } catch (error) {
    await t.rollback();
    throw error;
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

module.exports = {
  create,
  getAll,
  getById,
};
