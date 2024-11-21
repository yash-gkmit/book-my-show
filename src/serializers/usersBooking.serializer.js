const serialize = (req, res, next) => {
  const { data } = res;

  const response = {
    message: ' ',
    bookings: [],
    transactions: [],
    pagination: null,
  };

  if (data && data.result) {
    const { data: items, pagination } = data.result;

    if (Array.isArray(items)) {
      // Handle bookings serialization
      if (req.originalUrl.includes('/bookings')) {
        response.message = 'Booking of specific user fetched successfully!';

        response.bookings = items.map(booking => ({
          id: booking.id,
          userId: booking.user_id,
          showId: booking.show_id,
          numberOfSeat: booking.number_of_seat,
          bookingDate: booking.booking_date,
          bookingStatus: booking.booking_status,
          totalAmount: booking.total_amount,
          show: booking?.show && {
            id: booking.show.id,
            movieId: booking.show.movie_id,
            theaterId: booking.show.theater_id,
            showTime: booking.show.show_time,
            availableSeats: booking.show.available_seats,
            type: booking.show.type,
            price: booking.show.price,
            theater: booking?.show?.theater && {
              id: booking.show.theater.id,
              cityId: booking.show.theater.city_id,
              name: booking.show.theater.name,
              address: booking.show.theater.address,
            },
          },
          transaction:
            booking?.transaction &&
            booking.transaction.map(txn => ({
              id: txn.id,
              bookingId: txn.booking_id,
              transactionStatus: txn.transaction_status,
              transactionAmount: txn.transaction_amount,
              GST: txn.GST,
              CGST: txn.CGST,
              IGST: txn.IGST,
              SGST: txn.SGST,
            })),
          user: booking?.user && {
            id: booking.user.id,
            name: booking.user.name,
            email: booking.user.email,
            phone: booking.user.phone,
          },
        }));
      }

      // Handle transactions serialization
      if (req.originalUrl.includes('/transactions')) {
        response.message = 'Transaction of specific user fetched successfully!';

        response.transactions = items.map(transaction => ({
          id: transaction?.id,
          show: transaction?.show && {
            id: transaction.show.id,
            movieId: transaction.show.movie_id,
            theaterId: transaction.show.theater_id,
            showTime: transaction.show.show_time,
            availableSeats: transaction.show.available_seats,
            type: transaction.show.type,
            price: transaction.show.price,
          },
          transaction: transaction?.transaction,
          user: transaction.user && {
            id: transaction.user.id,
            name: transaction.user.name,
            email: transaction.user.email,
            phone: transaction.user.phone,
          },
        }));
      }
    }

    // Include pagination if available
    response.pagination = pagination || null;
  }

  // Remove empty arrays based on the endpoint
  if (!response.bookings.length) delete response.bookings;
  if (!response.transactions.length) delete response.transactions;

  // Set the serialized response
  res.data = { result: response };

  next();
};

module.exports = {
  serialize,
};
