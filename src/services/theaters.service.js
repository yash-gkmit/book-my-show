const { Theater } = require('../models');

exports.create = async data => {
  return await Theater.create(data);
};
