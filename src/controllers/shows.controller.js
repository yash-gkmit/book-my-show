const showService = require('../services/shows.service');
const { errorHandler } = require('../helpers/common.helper');

const generate = async (req, res, next) => {
  const payload = req.body;
  try {
    const show = await showService.create(payload);
    res.data = show;
    res.message = 'show created successfully!';
    res.statusCode = 201;
    next();
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const fetchAll = async (req, res, next) => {
  try {
    const payload = req.query;

    const shows = await showService.getAll(payload);

    res.message = 'fetched shows successfully';
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
        'an error occurred while fetching shows',
        error.statusCode || 400,
      );
    }
  }
};

const fetch = async (req, res, next) => {
  const { id } = req.params;
  try {
    const show = await showService.get(id);
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
  const payload = {
    id: req.params,
    data: req.body,
  };
  try {
    const show = await showService.update(payload);
    res.message = 'show data updated successfully!';
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
    res.message = 'show removed successfully!';
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
