const { User, UserRole } = require('../models');
const { throwCustomError } = require('../helpers/common.helper');

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

exports.delete = async userId => {
  const user = await User.findByPk(userId);
  console.log('Deleting user with ID:', userId);
  if (!user) throwCustomError('User not found', 404);

  await user.destroy();

  await UserRole.update(
    { deleted_at: new Date() },
    {
      where: { user_id: userId },
      individualHooks: true,
    },
  );
  return { message: 'User soft deleted successfully' };
};
