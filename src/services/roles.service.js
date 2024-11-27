const { Role } = require('../models');
const { throwCustomError } = require('../helpers/common.helper');

const create = async data => {
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
    const role = await Role.create(data);

    return role;
  } catch (error) {
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
  const { id, data } = payload;

  const role = await Role.findByPk(id);
  if (!role) {
    throwCustomError('Role not found!', 404);
  }

  await role.update(data);

  return role;
};

const remove = async id => {
  if (!id) {
    throwCustomError('Invalid ID provided', 400);
  }

  const role = await Role.findByPk(id);
  if (!role) {
    throwCustomError('Role not found!', 404);
  }

  await role.destroy();

  return { message: 'Role deleted successfully!' };
};

module.exports = {
  create,
  getAll,
  get,
  update,
  remove,
};
