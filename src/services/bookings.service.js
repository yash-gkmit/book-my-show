const { Booking, Show, sequelize } = require('../models');
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

module.exports = {
  create,
};
