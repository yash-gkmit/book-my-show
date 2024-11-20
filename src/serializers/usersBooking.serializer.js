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
          user_id: booking.user_id,
          show_id: booking.show_id,
          number_of_seat: booking.number_of_seat,
          booking_date: booking.booking_date,
          booking_status: booking.booking_status,
          total_amount: booking.total_amount,
          show: booking.show
            ? {
                id: booking.show.id,
                movie_id: booking.show.movie_id,
                theater_id: booking.show.theater_id,
                show_time: booking.show.show_time,
                available_seats: booking.show.available_seats,
                type: booking.show.type,
                price: booking.show.price,
                theater: booking.show.theater
                  ? {
                      id: booking.show.theater.id,
                      city_id: booking.show.theater.city_id,
                      name: booking.show.theater.name,
                      address: booking.show.theater.address,
                    }
                  : null,
              }
            : null,
          transaction: booking.transaction
            ? booking.transaction.map(txn => ({
                id: txn.id,
                booking_id: txn.booking_id,
                transaction_status: txn.transaction_status,
                transaction_amount: txn.transaction_amount,
                GST: txn.GST,
                CGST: txn.CGST,
                IGST: txn.IGST,
                SGST: txn.SGST,
              }))
            : [],
          user: booking.user
            ? {
                id: booking.user.id,
                name: booking.user.name,
                email: booking.user.email,
                phone: booking.user.phone,
              }
            : null,
        }));
      }

      // Handle transactions serialization
      if (req.originalUrl.includes('/transactions')) {
        response.message = 'Transaction of specific user fetched successfully!';

        response.transactions = items.map(transaction => ({
          id: transaction.id,
          show: transaction.show
            ? {
                id: transaction.show.id,
                movie_id: transaction.show.movie_id,
                theater_id: transaction.show.theater_id,
                show_time: transaction.show.show_time,
                available_seats: transaction.show.available_seats,
                type: transaction.show.type,
                price: transaction.show.price,
              }
            : null,
          transaction: transaction.transaction || [],
          user: transaction.user
            ? {
                id: transaction.user.id,
                name: transaction.user.name,
                email: transaction.user.email,
                phone: transaction.user.phone,
              }
            : null,
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
