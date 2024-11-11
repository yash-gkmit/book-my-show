const { User } = require('../models');

exports.getAll = async () => {
  return await User.findAll();
};
