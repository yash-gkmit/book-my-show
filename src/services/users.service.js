const { User } = require('../models');

exports.getAll = async () => {
  return await User.findAll();
};

exports.getById = async userId => {
  return await User.findByPk(userId);
};

exports.update = async (userId, data) => {
  const user = await User.findByPk(userId);
  if (!user) throwCustomError('User not found', 404);

  await user.update(data);
  return user;
};
