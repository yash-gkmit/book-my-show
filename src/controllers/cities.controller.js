const cityService = require('../services/cities.service');
const { errorHandler, throwCustomError } = require('../helpers/common.helper');

const generate = async (req, res, next) => {
  try {
    const city = await cityService.create(req.body);
    res.data = { message: 'City created successfully', city };
    res.statusCode = 201;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchAll = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const cities = await cityService.getAll(page, limit);

    if (!cities.data || cities.data.length === 0) {
      throwCustomError('No cities found', 404);
    }

    res.data = { message: 'Fetching all cities details', cities };
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchById = async (req, res, next) => {
  try {
    const city = await cityService.getById(req.params.id);
    res.data = { message: 'Fetching specific city details', city };
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 404);
  }
};

const change = async (req, res, next) => {
  try {
    const city = await cityService.update(req.params.id, req.body);
    res.data = { message: 'City updated successfully', city };
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const remove = async (req, res, next) => {
  try {
    await cityService.remove(req.params.id);
    res.data = { message: 'City deleted successfully' };
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
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
      message: 'Theater fetched by city successfully!',
      theaters,
    };
    res.statusCode = 200;
    next();
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 404);
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
      message: 'Report generated successfully.',
      filePath: filePath,
    };
    res.statusCode = 200;
    next();
  } catch (error) {
    console.error('Error generating city-based report:', error);
    return res.status(500).json({
      message: 'Failed to generate city-based report.',
      error: error.message,
    });
  }
};

module.exports = {
  generate,
  fetchAll,
  fetchById,
  change,
  remove,
  fetchTheaters,
  fetchReport,
};
