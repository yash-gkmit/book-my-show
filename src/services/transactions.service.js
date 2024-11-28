const {
  Transaction,
  Booking,
  Show,
  User,
  Movie,
  sequelize,
  Theater,
} = require('../models');
const { Op } = require('sequelize');
const { sendTransactionEmail } = require('../helpers/mail.helper');
const { throwCustomError } = require('../helpers/common.helper');

const create = async payload => {
  const t = await sequelize.transaction();
  try {
    const transactionData = {
      user_id: payload.userId,
      booking_id: payload.bookingId,
    };

    const booking = await Booking.findByPk(payload.bookingId, {
      include: [
        { model: Show, as: 'show', include: [{ model: Movie, as: 'movie' }] },
        { model: User, as: 'user' },
      ],
      transaction: t,
    });

    if (!booking) {
      throwCustomError('Booking not found', 404);
    }
    if (booking.booking_status === 'Confirmed') {
      throwCustomError('Payment of this booking already provided!', 400);
    }
    if (!booking.user) {
      throwCustomError('User not found for this booking', 404);
    }

    const show = booking.show;

    if (!show) {
      throwCustomError('Show not found', 404);
    }

    const amount = booking.total_amount;

    const GST = amount * 0.18;
    const CGST = amount * 0.18;
    const IGST = amount * 0.18;
    const SGST = amount * 0.18;
    const total_gst = GST + CGST + IGST + SGST;
    const amount_paid = amount + total_gst;

    const transaction = await Transaction.create(
      {
        amount,
        GST,
        CGST,
        IGST,
        SGST,
        ...transactionData,
      },
      { transaction: t },
    );

    console.log('cvbnm', transaction);

    transaction.status = 'Success';
    await transaction.save({ transaction: t });

    if (transaction.status === 'Success') {
      booking.status = 'Confirmed';
      await booking.save({ transaction: t });

      show.available_seats -= booking.number_of_seats;
      await show.save({ transaction: t });

      const templateData = {
        description: 'Your booking transaction was successful.',
        movie_name: show.movie.name,
        time: show.time,
        show_date: booking.booking_date,
        booking_date: booking.created_at,
        total_amount: amount,
        total_gst,
        amount_paid,
        booking_status: 'Confirmed',
      };

      await sendTransactionEmail({
        to: booking.user.email,
        subject: 'Transaction Completed',
        templateName: 'transaction-complete',
        templateData: templateData,
      });
    }

    await t.commit();
    return transaction;
  } catch (error) {
    console.log('dfg', error);
    await t.rollback();
    throw error;
  }
};

const getAll = async payload => {
  const { page = 1, limit = 10, ...filters } = payload;

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
    order: [['created_at', 'DESC']],
    offset,
    limit: parseInt(limit),
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

const get = async payload => {
  const { id } = payload;

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

const remove = async payload => {
  const { id } = payload;

  const transaction = await Transaction.findByPk(id);
  if (!transaction) {
    throwCustomError('Transaction not found', 404);
  }

  await transaction.destroy();
};

module.exports = {
  create,
  getAll,
  get,
  remove,
};
