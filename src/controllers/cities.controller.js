const cityService = require('../services/cities.service');
const { errorHandler, throwCustomError } = require('../helpers/common.helper');

const generate = async (req, res, next) => {
  try {
    const city = await cityService.create(req.body);
    res.message = 'City created successfully';
    res.data = city;
    res.statusCode = 201;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const fetchAll = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const cities = await cityService.getAll(page, limit);

    if (!cities.data || cities.data.length === 0) {
      throwCustomError('No cities found', 404);
    }

    res.message = 'Fetching all cities details';
    res.data = cities;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const fetch = async (req, res, next) => {
  try {
    const city = await cityService.get(req.params.id);
    res.message = 'Fetching specific city details';
    res.data = city;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 404);
  }
};

const change = async (req, res, next) => {
  try {
    const city = await cityService.update(req.params.id, req.body);
    res.message = 'City updated successfully';
    res.data = city;
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const remove = async (req, res, next) => {
  try {
    await cityService.remove(req.params.id);
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 400);
  }
};

const fetchTheaters = async (req, res, next) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const theaters = await cityService.getTheaters(id, page, limit);

    if (!theaters.data.length) {
      throwCustomError('No theaters found for the specified city.', 404);
    }

    res.data = {
      theaters,
    };
    res.message = 'Theater by city fetched successfully';
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error, error.statusCode || 404);
  }
};

const fetchReport = async (req, res, next) => {
  try {
    const { city, startDate, endDate } = req.query;

    if (!city) {
      throwCustomError('City Not found');
    }

    const filePath = await cityService.generateReport(city, startDate, endDate);

    res.data = {
      filePath: filePath,
    };
    res.message = 'Report generated successfully';
    res.statusCode = 200;
    next();
  } catch (error) {
    console.error('Error generating city-based report:', error);
    return res.status(400).json({
      message: 'Failed to generate city-based report.',
      error: error.message,
    });
  }
};

module.exports = {
  generate,
  fetchAll,
  fetch,
  change,
  remove,
  fetchTheaters,
  fetchReport,
};
