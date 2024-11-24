const {
  Transaction,
  Booking,
  Show,
  User,
  Movie,
  sequelize,
  Theater,
} = require('../models');
const { sendTransactionEmail } = require('../helpers/mail.helper');
const { throwCustomError } = require('../helpers/common.helper');

const create = async data => {
  const t = await sequelize.transaction();
  try {
    const transactionData = {
      user_id: data.userId,
      booking_id: data.bookingId,
    };

    const booking = await Booking.findByPk(data.bookingId, {
      include: [
        { model: Show, as: 'show', include: [{ model: Movie, as: 'movie' }] },
        { model: User, as: 'user' },
      ],
      transaction: t,
    });

    if (!booking) {
      throwCustomError('Booking not found', 404);
    }
    if (!booking.user) {
      throwCustomError('User not found for this booking', 404);
    }

    const show = booking.show;

    if (!show) {
      throwCustomError('Show not found', 404);
    }
    const transaction_amount = booking.total_amount;

    const GST = transaction_amount * 0.18;
    const CGST = transaction_amount * 0.18;
    const IGST = transaction_amount * 0.18;
    const SGST = transaction_amount * 0.18;
    const total_gst = GST + CGST + IGST + SGST;
    const amount_paid = transaction_amount + total_gst;

    const transaction = await Transaction.create(
      {
        transaction_amount,
        GST,
        CGST,
        IGST,
        SGST,
        ...transactionData,
      },
      { transaction: t },
    );

    transaction.transaction_status = 'Success';
    await transaction.save({ transaction: t });

    if (transaction.transaction_status === 'Success') {
      booking.booking_status = 'Confirmed';
      await booking.save({ transaction: t });

      show.available_seats -= booking.number_of_seats;
      await show.save({ transaction: t });

      await sendTransactionEmail({
        to: booking.user.email,
        subject: 'Transaction Completed',
        description: 'Your booking transaction was successful.',
        movie_name: show.movie.name,
        show_time: show.show_time,
        show_date: booking.booking_date,
        booking_date: booking.created_at,
        total_amount: transaction_amount,
        total_gst,
        amount_paid,
        booking_status: 'Confirmed',
      });
    }

    await t.commit();
    return transaction;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getAll = async (filters, page = 1, limit = 10) => {
  const whereConditions = {};

  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Transaction.rawAttributes).includes(key)) {
      whereConditions[key] = { [Op.eq]: value };
    }
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Transaction.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: Booking,
        as: 'booking',
        include: [
          { model: Show, as: 'show', include: [{ model: Movie, as: 'movie' }] },
          { model: User, as: 'user' },
        ],
      },
    ],
    offset,
    limit: parseInt(limit),
    order: [['created_at', 'DESC']],
  });

  return {
    data: rows,
    pagination: {
      totalItems: count,
      currentPage: parseInt(page),
      itemsPerPage: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

const get = async id => {
  const transaction = await Transaction.findOne({
    where: { id },
    include: [
      {
        model: Booking,
        as: 'booking',
        include: [
          {
            model: Show,
            as: 'show',
            include: [
              { model: Movie, as: 'movie' },
              { model: Theater, as: 'theater' },
            ],
          },
        ],
      },
    ],
  });

  if (!transaction) {
    throwCustomError('Transaction not found', 404);
  }

  return transaction;
};

const remove = async id => {
  const transaction = await sequelize.transaction();

  try {
    const transactionRecord = await Transaction.findByPk(id, { transaction });
    if (!transactionRecord) {
      throwCustomError('Transaction not found', 404);
    }

    await transactionRecord.destroy({ transaction });

    await transaction.commit();
    return { message: 'Transaction removed successfully' };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  create,
  getAll,
  get,
  remove,
};
