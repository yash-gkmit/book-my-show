const cityService = require('../services/cities.service');
const { errorHandler, throwCustomError } = require('../helpers/common.helper');

const generate = async (req, res) => {
  try {
    const city = await cityService.create(req.body);
    res.status(201).json({ message: 'City created successfully', data: city });
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchAll = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const cities = await cityService.getAll(page, limit);

    if (!cities.data || cities.data.length === 0) {
      throwCustomError('No cities found', 404);
    }

    res.status(200).json(cities);
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchById = async (req, res) => {
  try {
    const city = await cityService.getById(req.params.id);
    res.status(200).json({ data: city });
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 404);
  }
};

const change = async (req, res) => {
  try {
    const city = await cityService.update(req.params.id, req.body);
    res.status(200).json({ message: 'City updated successfully', data: city });
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const remove = async (req, res) => {
  try {
    await cityService.remove(req.params.id);
    res.status(200).json({ message: 'City deleted successfully' });
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

const fetchReport = async (req, res) => {
  try {
    const { city, startDate, endDate } = req.query;

    if (!city) {
      return res.status(400).json({ message: 'City is required.' });
    }

    const filePath = await cityService.generateReport(city, startDate, endDate);

    return res.status(200).json({
      message: 'Report generated successfully.',
      filePath: filePath,
    });
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
  fetchReport,
};
