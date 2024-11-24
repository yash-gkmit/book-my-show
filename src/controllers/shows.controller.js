const showService = require('../services/shows.service');
const { errorHandler } = require('../helpers/common.helper');

const generate = async (req, res, next) => {
  try {
    const show = await showService.create(req.body);
    res.data = show;
    res.message = 'Show created successfully!';
    res.statusCode = 201;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const fetchAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    const shows = await showService.getAll(filters, page, limit);

    res.message = 'Fetched shows successfully';
    res.data = {
      shows,
    };
    res.statusCode = 200;

    next();
  } catch (error) {
    if (error.statusCode) {
      errorHandler(req, res, error, error.statusCode || 400);
    } else {
      errorHandler(
        req,
        res,
        'An error occurred while fetching shows',
        error.statusCode || 400,
      );
    }
  }
};

const fetch = async (req, res, next) => {
  try {
    const show = await showService.get(req.params.id);
    res.message = 'Fetched show By Id successfully';
    res.data = {
      show,
    };
    res.statusCode = 200;

    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const change = async (req, res, next) => {
  try {
    const show = await showService.update(req.params.id, req.body);
    res.message = 'Show data updated successfully!';
    res.data = show;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const remove = async (req, res, next) => {
  try {
    await showService.remove(req.params.id);
    res.message = 'Show removed successfully!';
    res.statusCode = 204;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error, 400);
  }
};

module.exports = {
  generate,
  fetchAll,
  fetch,
  change,
  remove,
};
