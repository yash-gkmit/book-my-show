const { City, sequelize } = require('../models');
const { throwCustomError } = require('../helpers/common.helper');

const create = async data => {
  const transaction = await sequelize.transaction();

  try {
    const city = await City.create(data, { transaction });

    await transaction.commit();

    return city;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getAll = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  try {
    const cities = await City.findAndCountAll({
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      data: cities.rows,
      pagination: {
        totalItems: cities.count,
        currentPage: parseInt(page, 10),
        itemsPerPage: parseInt(limit, 10),
        totalPages: Math.ceil(cities.count / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

const getById = async id => {
  const city = await City.findByPk(id);
  if (!city) throwCustomError('City not found', 404);
  return city;
};

const update = async (id, data) => {
  const transaction = await sequelize.transaction();

  try {
    const city = await City.findByPk(id, { transaction });
    if (!city) {
      await transaction.rollback();
      throwCustomError('City not found', 404);
    }

    await city.update(data, { transaction });

    await transaction.commit();
    return city;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const remove = async id => {
  const transaction = await sequelize.transaction();

  try {
    const city = await City.findByPk(id, { transaction });
    if (!city) {
      await transaction.rollback();
      throwCustomError('City not found', 404);
    }

    await city.destroy({ transaction });

    await transaction.commit();
    return { message: 'City deleted successfully' };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};
