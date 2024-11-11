const { City } = require('../models');

exports.create = async data => {
  return await City.create(data);
};

exports.getAll = async () => {
  return await City.findAll();
};
