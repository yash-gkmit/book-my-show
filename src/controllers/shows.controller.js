const showService = require('../services/shows.service');
const { errorHandler } = require('../helpers/common.helper');

const generate = async (req, res, next) => {
  try {
    const show = await showService.create(req.body);
    res.data = show;
    console.log(res.data);
    res.statusCode = 201;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    const shows = await showService.getAll(filters, page, limit);

    res.data = {
      message: 'Fetched shows successfully',
      shows,
    };
    res.statusCode = 200;

    next();
  } catch (error) {
    console.log(error);

    if (error.statusCode) {
      errorHandler(req, res, error.message, error.statusCode);
    } else {
      errorHandler(req, res, 'An error occurred while fetching shows', 400);
    }
  }
};

const fetchById = async (req, res, next) => {
  try {
    const show = await showService.getById(req.params.id);
    res.data = {
      message: 'Fetched show By Id successfully',
      show,
    };
    res.statusCode = 200;

    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, 400);
  }
};

const change = async (req, res, next) => {
  try {
    const show = await showService.update(req.params.id, req.body);
    res.data = show;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, 400);
  }
};

const remove = async (req, res, next) => {
  try {
    await showService.remove(req.params.id);
    res.statusCode = 204;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, 400);
  }
};

module.exports = {
  generate,
  fetchAll,
  fetchById,
  change,
  remove,
};
