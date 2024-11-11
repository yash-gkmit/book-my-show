const cityService = require('../services/cities.service');
const { errorHandler, throwCustomError } = require('../helpers/common.helper');

exports.generate = async (req, res) => {
  try {
    const city = await cityService.create(req.body);
    res.status(201).json({ message: 'City created successfully', data: city });
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};

exports.fetchAll = async (req, res) => {
  try {
    const cities = await cityService.getAll();
    if (!cities || cities.length === 0) {
      throwCustomError('No cities found', 404);
    }
    res.status(200).json({ data: cities });
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};
