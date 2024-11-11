const { Theater } = require('../models');

exports.create = async data => {
  return await Theater.create(data);
};

exports.getAll = async () => await Theater.findAll();

exports.getById = async id => {
  const theater = await Theater.findByPk(id);
  if (!theater) throwCustomError('Theater not found', 404);
  return theater;
};

exports.update = async (id, data) => {
  const theater = await Theater.findByPk(id);
  if (!theater) throwCustomError('Theater not found', 404);
  await theater.update(data);
  return theater;
};
