const roleService = require('../services/roles.service');
const { errorHandler, throwCustomError } = require('../helpers/common.helper');

const generate = async (req, res, next) => {
  const { name } = req.body;
  try {
    const role = await roleService.create({ name });
    res.message = 'Role created successfully';
    res.data = role;
    res.statusCode = 201;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const fetchAll = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const roles = await roleService.getAll(page, limit);

    if (!roles.data) {
      throwCustomError('No roles found', 404);
    }

    res.message = 'All roles fetched successfully!';
    res.data = roles;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const fetch = async (req, res, next) => {
  const { id } = req.params;
  try {
    const role = await roleService.get({ id });
    res.message = 'Fetching specific role!';
    res.data = role;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 404);
  }
};

const change = async (req, res, next) => {
  const payload = {
    id: req.params.id,
    data: req.body,
  };

  try {
    const role = await roleService.update(payload);
    res.message = 'Role updated successfully';
    res.data = role;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const remove = async (req, res, next) => {
  try {
    await roleService.remove(req.params.id);
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

module.exports = {
  generate,
  fetchAll,
  fetch,
  change,
  remove,
};
