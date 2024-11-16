const {
  Transaction,
  Booking,
  Show,
  User,
  Movie,
  sequelize,
} = require('../models');
const { sendTransactionEmail } = require('../helpers/mail.helper');

const create = async data => {
  const { user_id, booking_id, transaction_amount } = data;

  const t = await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(booking_id, {
      include: [
        { model: Show, as: 'show', include: [{ model: Movie, as: 'movie' }] },
        { model: User, as: 'user' },
      ],
      transaction: t,
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (!booking.user) {
      throw new Error('User not found for this booking');
    }

    const show = booking.show;

    if (show.available_seats < booking.number_of_seat) {
      throw new Error('Insufficient seats available');
    }

    const GST = transaction_amount * 0.18;
    const CGST = transaction_amount * 0.18;
    const IGST = transaction_amount * 0.18;
    const SGST = transaction_amount * 0.18;
    const total_gst = GST + CGST + IGST + SGST;
    const amount_paid = transaction_amount + total_gst;

    // Create the transaction without specifying transaction_status
    const transaction = await Transaction.create(
      {
        user_id,
        booking_id,
        transaction_amount,
        GST,
        CGST,
        IGST,
        SGST,
      },
      { transaction: t },
    );

    // Update the transaction status to "Success" if the booking is confirmed
    transaction.transaction_status = 'Success';
    await transaction.save({ transaction: t });

    // Update booking and show availability if transaction is successful
    if (transaction.transaction_status === 'Success') {
      booking.booking_status = 'Confirmed';
      await booking.save({ transaction: t });

      show.available_seats -= booking.number_of_seat;
      await show.save({ transaction: t });

      // Send a transaction email notification
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

module.exports = {
  create,
};
