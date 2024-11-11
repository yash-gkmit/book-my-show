const { User } = require('../models');

exports.getAll = async () => {
  return await User.findAll();
};

exports.getById = async userId => {
  return await User.findByPk(userId);
};
