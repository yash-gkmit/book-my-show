const { City } = require('../models');

exports.create = async data => {
  return await City.create(data);
};

exports.getAll = async () => {
  return await City.findAll();
};

exports.getById = async id => {
  const city = await City.findByPk(id);
  if (!city) throwCustomError('City not found', 404);
  return city;
};
