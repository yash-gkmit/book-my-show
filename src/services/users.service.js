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

const getAll = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  try {
    const users = await User.findAll({
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    const totalUsers = await User.count();

    return {
      data: users,
      pagination: {
        totalItems: totalUsers,
        currentPage: parseInt(page, 10),
        itemsPerPage: parseInt(limit, 10),
        totalPages: Math.ceil(totalUsers / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};
const getById = async userId => {
  return await User.findByPk(userId);
};

const update = async (userId, data) => {
  const transaction = await sequelize.transaction();
  try {
    const user = await User.findByPk(userId, { transaction });
    if (!user) throwCustomError('User not found', 404);

    await user.update(data, { transaction });

    await transaction.commit();

    return user;
  } catch (error) {
    await transaction.rollback();
    throwCustomError(error);
  }
};

const remove = async userId => {
  const transaction = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId, { transaction });
    if (!user) throwCustomError('User not found');
    await user.destroy({ transaction });

    await UserRole.update(
      { deleted_at: new Date() },
      {
        where: { user_id: userId },
        individualHooks: true,
        transaction,
      },
    );

    await transaction.commit();

    return { message: 'User soft deleted successfully' };
  } catch (error) {
    await transaction.rollback();
    throwCustomError(error);
  }
};
const getBookings = async (userId, filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const bookingConditions = { user_id: userId };
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

  const transaction = await sequelize.transaction();
  try {
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
          model: Transaction,
          as: 'transaction',
        },
        {
          model: User,
          as: 'user',
          where: { id: userId },
        },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
      transaction,
    });

    await transaction.commit();

    return {
      data: result.rows,
      pagination: {
        totalItems: result.count,
        currentPage: parseInt(page, 10),
        itemsPerPage: parseInt(limit, 10),
        totalPages: Math.ceil(result.count / limit),
      },
    };
  } catch (error) {
    await transaction.rollback();
    throwCustomError(error);
  }
};

const getTransactions = async (userId, filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const transactionConditions = { user_id: userId };

  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Transaction.rawAttributes).includes(key)) {
      transactionConditions[key] = { [Op.eq]: value };
    }
  }

  const dbTransaction = await sequelize.transaction();
  try {
    const result = await Transaction.findAndCountAll({
      where: transactionConditions,
      include: [
        {
          model: User,
          as: 'user',
          where: { id: userId },
        },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
      transaction: dbTransaction,
    });

    await dbTransaction.commit();
    return {
      data: result.rows,
      pagination: {
        totalItems: result.count,
        currentPage: parseInt(page, 10),
        itemsPerPage: parseInt(limit, 10),
        totalPages: Math.ceil(result.count / limit),
      },
    };
  } catch (error) {
    await dbTransaction.rollback();
    throwCustomError(error);
  }
};

const getReports = async (page, limit) => {
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
      [sequelize.fn('DATE', sequelize.col('created_at')), 'registration_date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    group: ['registration_date'],
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
  getById,
  update,
  remove,
  getBookings,
  getTransactions,
  getReports,
};
