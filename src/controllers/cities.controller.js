const cityService = require('../services/cities.service');
const { errorHandler } = require('../helpers/common.helper');

exports.generate = async (req, res) => {
  try {
    const city = await cityService.create(req.body);
    res.status(201).json({ message: 'City created successfully', data: city });
  } catch (error) {
    errorHandler(req, res, error.message, error.statusCode || 400);
  }
};
