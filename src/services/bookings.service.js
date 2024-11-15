const { Booking, Show, Movie, sequelize } = require('../models');
const { throwCustomError } = require('../helpers/common.helper');

const create = async data => {
  const t = await sequelize.transaction();

  try {
    const show = await Show.findByPk(data.show_id, { transaction: t });
    if (!show) {
      throwCustomError('Show not found', 404);
    }

    if (show.available_seats < data.number_of_seat) {
      throwCustomError('Seats not available', 404);
    }

    const bookingData = {
      user_id: data.user_id,
      show_id: data.show_id,
      number_of_seat: data.number_of_seat,
      total_amount: data.number_of_seat * show.price,
      booking_status: 'Pending',
      booking_date: data.booking_date,
    };

    const booking = await Booking.create(bookingData, { transaction: t });

    show.available_seats -= data.number_of_seat;
    await show.save({ transaction: t });

    await t.commit();

    return booking;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getAll = async (filters, page = 1, limit = 10) => {
  const whereConditions = {};
  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Booking.rawAttributes).includes(key)) {
      whereConditions[key] = { [Op.eq]: value };
    }
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await Booking.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: Show,
        as: 'show',
        include: [{ model: Movie, as: 'movie' }],
      },
    ],
    offset,
    limit: parseInt(limit, 10),
    order: [['created_at', 'DESC']],
  });

  return {
    data: rows,
    pagination: {
      totalItems: count,
      currentPage: parseInt(page, 10),
      itemsPerPage: parseInt(limit, 10),
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getById = async id => {
  const booking = Booking.findByPk(id);
  if (!booking) {
    throwCustomError('Booking not found', 404);
  }

  return booking;
};

module.exports = {
  create,
  getAll,
  getById,
};
