const showService = require('../services/shows.service');
const { errorHandler } = require('../helpers/common.helper');

const create = async (req, res, next) => {
  const payload = req.body;
  try {
    const show = await showService.create(payload);
    res.data = show;
    res.message = 'Show created successfully!';
    res.statusCode = 201;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const getAll = async (req, res, next) => {
  try {
    const payload = req.query;

    const shows = await showService.getAll(payload);

    res.message = 'Fetched shows successfully';
    res.data = shows;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(
      req,
      res,
      error.message || 'Error fetching shows',
      error.statusCode || 400,
    );
  }
};

const get = async (req, res, next) => {
  const { id } = req.params;
  try {
    const show = await showService.get(id);
    res.message = 'Fetched show by id successfully';
    res.data = {
      show,
    };
    res.statusCode = 200;

    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const update = async (req, res, next) => {
  const payload = {
    id: req.params,
    data: req.body,
  };
  try {
    const show = await showService.update(payload);
    res.message = 'Show data updated successfully!';
    res.data = show;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const remove = async (req, res, next) => {
  const { id } = req.params;
  try {
    await showService.remove(id);
    res.message = 'Show removed successfully!';
    res.statusCode = 204;
    next();
  } catch (error) {
    errorHandler(req, res, error, 400);
  }
};

module.exports = {
  create,
  getAll,
  get,
  update,
  remove,
};
