const {
  User,
  UserRole,
  Booking,
  Show,
  Theater,
  Transaction,
  sequelize,
} = require('../models');
const { Op } = require('sequelize');
const { throwCustomError } = require('../helpers/common.helper');

const getAll = async payload => {
  const { page = 1, limit = 10 } = payload;

  const offset = (page - 1) * limit;

  const users = await User.findAll({
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  const totalUsers = await User.count();

  return {
    users: users,
    pagination: {
      totalItems: totalUsers,
      currentPage: parseInt(page, 10),
      itemsPerPage: parseInt(limit, 10),
      totalPages: Math.ceil(totalUsers / limit),
    },
  };
};

const get = async payload => {
  const { id } = payload;
  const user = await User.findByPk(id);
  if (!user) {
    throwCustomError('user with this id does not exist', 404);
  }
  return user;
};

const update = async payload => {
  const { id } = payload.id;
  const data = payload.body;

  const user = await User.findOne({
    where: { id: id },
  });
  if (!user) throwCustomError('user not found', 404);

  await user.update(data);
};

const remove = async payload => {
  const { id } = payload;

  const user = await User.findByPk(id, { transaction });
  if (!user) throwCustomError('User not found');
  await user.destroy({ transaction });

  await UserRole.update(
    { deleted_at: new Date() },
    {
      where: { user_id: id },
      individualHooks: true,
      transaction,
    },
  );
};

const getBookings = async payload => {
  const { id } = payload.id;
  const { filters = {}, page = 1, limit = 10 } = payload.filters;

  const offset = (page - 1) * limit;
  const bookingConditions = { user_id: id };
  const showConditions = {};

  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Booking.rawAttributes).includes(key)) {
      bookingConditions[key] = { [Op.eq]: value };
    }
  }

  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Show.rawAttributes).includes(key)) {
      showConditions[key] = { [Op.eq]: value };
    }
  }

  const result = await Booking.findAndCountAll({
    where: bookingConditions,
    include: [
      {
        model: Show,
        as: 'show',
        where: showConditions,
        include: [
          {
            model: Theater,
            as: 'theater',
          },
        ],
      },
      {
        model: User,
        as: 'user',
        where: { id: id },
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    data: result.rows,
    pagination: {
      totalItems: result.count,
      currentPage: parseInt(page, 10),
      itemsPerPage: parseInt(limit, 10),
      totalPages: Math.ceil(result.count / limit),
    },
  };
};

const getTransactions = async payload => {
  const { id } = payload.id;
  const { filters = {}, page = 1, limit = 10 } = payload.filters;
  const offset = (page - 1) * limit;
  const transactionConditions = { user_id: id };

  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Transaction.rawAttributes).includes(key)) {
      transactionConditions[key] = { [Op.eq]: value };
    }
  }

  const result = await Transaction.findAndCountAll({
    where: transactionConditions,
    include: [
      {
        model: User,
        as: 'user',
        where: { id: id },
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    data: result.rows,
    pagination: {
      totalItems: result.count,
      currentPage: parseInt(page, 10),
      itemsPerPage: parseInt(limit, 10),
      totalPages: Math.ceil(result.count / limit),
    },
  };
};

const getReports = async payload => {
  const { page = 1, limit = 10 } = payload;
  const offset = (page - 1) * limit;

  const totalUsers = await User.count();

  const newRegistrations = await User.count({
    where: {
      created_at: {
        [Op.gte]: new Date(new Date() - 24 * 60 * 60 * 1000),
      },
    },
  });

  const registrationHistory = await User.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('created_at')), 'registrationDate'],
      [
        sequelize.cast(sequelize.fn('COUNT', sequelize.col('id')), 'integer'),
        'count',
      ],
    ],
    group: ['registrationDate'],
    limit,
    offset,
  });

  return {
    totalUsers,
    newRegistrations,
    registrationHistory,
  };
};

module.exports = {
  getAll,
  get,
  update,
  remove,
  getBookings,
  getTransactions,
  getReports,
};
