const showService = require('../services/shows.service');
const { responseHandler, errorHandler } = require('../helpers/common.helper');

const generate = async (req, res) => {
  try {
    const show = await showService.create(req.body);
    res.data = show;
    console.log(res.data);
    res.statusCode = 201;
    responseHandler(req, res);
  } catch (error) {
    console.log(error);
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    const shows = await showService.getAll(filters, page, limit);

    res.data = {
      message: 'Fetched shows successfully',
      shows,
    };
    res.statusCode = 200;

    responseHandler(req, res);
  } catch (error) {
    console.log(error);

    if (error.statusCode) {
      errorHandler(req, res, error.message, error.statusCode);
    } else {
      errorHandler(req, res, 'An error occurred while fetching shows', 400);
    }
  }
};

module.exports = {
  generate,
  fetchAll,
};
