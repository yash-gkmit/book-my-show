const serialize = (req, res, next) => {
  let { users } = res.data || {};
  let response = [];

  if (!users) {
    users = [res.data];
  }

  for (const user of users) {
    const data = {};
    data.id = user.id;
    data.name = user.name;
    data.email = user.email;
    data.phone = user.phone;
    data.createdAt = user.created_at;
    data.updatedAt = user.updated_at;

    response.push(data);
  }

  if (!res.data.users) {
    res.data = response[0];
  } else {
    res.data.users = response;
  }

  next();
};

const bookingSerialize = (req, res, next) => {
  const { data } = res;
  console.log(data);

  const response = {
    bookings: [],
    transactions: [],
    pagination: null,
  };

  if (data) {
    const { data: items, pagination } = data;

    if (Array.isArray(items)) {
      if (req.originalUrl.includes('/bookings')) {
        response.bookings = items.map(booking => ({
          id: booking.id,
          userId: booking.user_id,
          showId: booking.show_id,
          numberOfSeat: booking.number_of_seat,
          bookingDate: booking.booking_date,
          bookingStatus: booking.booking_status,
          totalAmount: booking.total_amount,
          createdAt: booking.created_at,
          updatedAt: booking.updated_at,
          show: booking?.show && {
            id: booking.show.id,
            movieId: booking.show.movie_id,
            theaterId: booking.show.theater_id,
            showTime: booking.show.show_time,
            availableSeats: booking.show.available_seats,
            type: booking.show.type,
            price: booking.show.price,
            createdAt: booking.show.created_at,
            updatedAt: booking.show.updated_at,
            theater: booking?.show?.theater && {
              id: booking.show.theater.id,
              cityId: booking.show.theater.city_id,
              name: booking.show.theater.name,
              address: booking.show.theater.address,
              createdAt: booking.show.theater.created_at,
              updatedAt: booking.show.theater.updated_at,
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
              createdAt: txn.created_at,
              updatedAt: txn.updated_at,
            })),
          user: booking?.user && {
            id: booking.user.id,
            name: booking.user.name,
            email: booking.user.email,
            phone: booking.user.phone,
            createdAt: booking.user.created_at,
            updatedAt: booking.user.updated_at,
          },
        }));
      }

      if (req.originalUrl.includes('/transactions')) {
        response.transactions = items.map(transaction => ({
          id: transaction?.id,
          bookingId: transaction?.booking_id,
          show: transaction?.show && {
            id: transaction?.show?.id,
            movieId: transaction?.show?.movie_id,
            theaterId: transaction?.show?.theater_id,
            showTime: transaction?.show?.show_time,
            availableSeats: transaction?.show?.available_seats,
            type: transaction?.show?.type,
            price: transaction?.show?.price,
            createdAt: transaction?.show?.created_at,
            updatedAt: transaction?.show?.updated_at,
          },
          transaction: transaction.transaction,
          user: transaction?.user && {
            id: transaction?.user?.id,
            name: transaction?.user?.name,
            email: transaction?.user?.email,
            phone: transaction?.user?.phone,
            createdAt: transaction?.user?.created_at,
            updatedAt: transaction?.user?.updated_at,
          },
        }));
      }
    }

    response.pagination = pagination || null;
  }

  if (!response.bookings.length) delete response.bookings;
  if (!response.transactions.length) delete response.transactions;

  res.data = response;

  next();
};

module.exports = {
  serialize,
  bookingSerialize,
};
