const { Role, sequelize } = require('../models');
const { throwCustomError } = require('../helpers/common.helper');

const create = async data => {
  const transaction = await sequelize.transaction();

  try {
    if (!data) {
      throwCustomError("Invalid input: 'name' is required.", 400);
    }
    const isRoleExist = await Role.findOne({
      where: { name: data.name },
    });

    if (isRoleExist) {
      throwCustomError('Role already exist!', 400);
    }
    const role = await Role.create(data, { transaction });

    await transaction.commit();

    return role;
  } catch (error) {
    await transaction.rollback();

    if (error.name === 'SequelizeValidationError') {
      throwCustomError(error.errors.map(err => err.message).join(', '), 400);
    }
    throwCustomError(error);
  }
};

const getAll = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const roles = await Role.findAndCountAll({
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    data: roles.rows,
    pagination: {
      totalItems: roles.count,
      currentPage: parseInt(page, 10),
      itemsPerPage: parseInt(limit, 10),
      totalPages: Math.ceil(roles.count / limit),
    },
  };
};

const get = async payload => {
  const role = await Role.findByPk(payload.id);
  if (!role) throwCustomError('Role not found!', 404);
  return role;
};

const update = async payload => {
  const transaction = await sequelize.transaction();
  const { id, data } = payload;

  try {
    const role = await Role.findByPk(id, { transaction });
    if (!role) {
      throwCustomError('Role not found!', 404);
    }

    await role.update(data, { transaction });
    await transaction.commit();

    return role;
  } catch (error) {
    await transaction.rollback();
    throwCustomError(error || 'An error occurred', 500);
  }
};

const remove = async id => {
  const transaction = await sequelize.transaction();

  try {
    if (!id) {
      throwCustomError('Invalid ID provided', 400);
    }

    const role = await Role.findByPk(id, { transaction });
    if (!role) {
      throwCustomError('Role not found!', 404);
    }

    await role.destroy({ transaction });
    await transaction.commit();

    return { message: 'Role deleted successfully!' };
  } catch (error) {
    await transaction.rollback();
    throwCustomError(error || 'An error occurred', error.statusCode || 500);
  }
};

module.exports = {
  create,
  getAll,
  get,
  update,
  remove,
};
