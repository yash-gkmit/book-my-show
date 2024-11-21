const serialize = (req, res, next) => {
  console.log(
    'res.data before serialization:',
    JSON.stringify(res.data, null, 2),
  );

  let { message, transaction, data: transactions, pagination } = res.data || {};

  const response = {
    message: message || 'Transactions fetched successfully!',
    transaction: null,
    transactions: [],
    pagination: {},
  };

  // Handle single transaction case
  if (!res.data.data && !transaction) {
    transaction = res.data;
  }

  // Populate single transaction
  if (transaction) {
    response.transaction = {
      id: transaction?.id,
      bookingId: transaction?.booking_id,
      userId: transaction?.user_id,
      transactionStatus: transaction?.transaction_status,
      transactionAmount: transaction?.transaction_amount,
      GST: transaction?.GST,
      CGST: transaction?.CGST,
      IGST: transaction?.IGST,
      SGST: transaction?.SGST,
      booking: transaction?.booking && {
        id: transaction?.booking?.id,
        userId: transaction?.booking?.user_id,
        showId: transaction?.booking?.show_id,
        numberOfSeat: transaction?.booking?.number_of_seat,
        bookingDate: transaction?.booking?.booking_date,
        bookingStatus: transaction?.booking?.booking_status,
        totalAmount: transaction?.booking?.total_amount,
        show: transaction?.booking?.show && {
          id: transaction?.booking?.show?.id,
          movieId: transaction?.booking?.show?.movie_id,
          theaterId: transaction?.booking?.show?.theater_id,
          showTime: transaction?.booking?.show?.show_time,
          availableSeats: transaction.booking.show.available_seats || 0,
          type: transaction?.booking?.show?.type,
          price: transaction?.booking?.show?.price,
          movie: transaction?.booking?.show?.movie && {
            id: transaction?.booking?.show?.movie?.id,
            name: transaction?.booking?.show?.movie?.name,
            summary: transaction?.booking?.show?.movie?.summary,
            releaseDate: transaction?.booking?.show?.movie?.release_date,
            castMemberList: transaction?.booking?.show?.movie?.cast_member_list,
            genre: transaction?.booking?.show?.movie?.genre,
            language: transaction?.booking?.show?.movie?.language,
            category: transaction?.booking?.show?.movie?.category,
            poster: transaction?.booking?.show?.movie?.poster,
            trailer: transaction?.booking?.show?.movie?.trailer,
          },
        },
      },
    };
  }

  // Populate multiple transactions
  if (Array.isArray(transactions) && transactions?.length > 0) {
    response.transactions = transactions.map(transaction => ({
      id: transaction?.id,
      bookingId: transaction?.booking_id,
      userId: transaction?.user_id,
      transactionStatus: transaction?.transaction_status,
      transactionAmount: transaction?.transaction_amount,
      GST: transaction?.GST,
      CGST: transaction?.CGST,
      IGST: transaction?.IGST,
      SGST: transaction?.SGST,
      booking: transaction?.booking && {
        id: transaction?.booking?.id,
        userId: transaction?.booking?.user_id,
        showId: transaction?.booking?.show_id,
        numberOfSeat: transaction?.booking?.number_of_seat,
        bookingDate: transaction?.booking?.booking_date,
        bookingStatus: transaction?.booking?.booking_status,
        totalAmount: transaction?.booking?.total_amount,
        show: transaction?.booking?.show && {
          id: transaction?.booking?.show?.id,
          movieId: transaction?.booking?.show?.movie_id,
          theaterId: transaction?.booking?.show?.theater_id,
          showTime: transaction?.booking?.show?.show_time,
          availableSeats: transaction.booking.show.available_seats || 0,
          type: transaction?.booking?.show?.type,
          price: transaction?.booking?.show?.price,
          movie: transaction?.booking?.show?.movie && {
            id: transaction?.booking?.show?.movie?.id,
            name: transaction?.booking?.show?.movie?.name,
            summary: transaction?.booking?.show?.movie?.summary,
            releaseDate: transaction?.booking?.show?.movie?.release_date,
            castMemberList:
              transaction?.booking?.show?.movie?.cast_member_list || [],
            genre: transaction?.booking?.show?.movie?.genre,
            language: transaction?.booking?.show?.movie?.language,
            category: transaction?.booking?.show?.movie?.category,
            poster: transaction?.booking?.show?.movie?.poster,
            trailer: transaction?.booking?.show?.movie?.trailer,
          },
        },
      },
    }));

    if (pagination) {
      response.pagination = pagination;
    }
  }

  // Handle case where no data is found
  if (!response.transaction && response.transactions.length === 0) {
    response.message = 'No transaction data found!';
  }

  // Adjust response for getAll
  if (response.transactions.length > 0) {
    delete response.transaction;
  }

  // Remove pagination if no data is available
  if (!pagination || Object.keys(pagination).length === 0) {
    delete response.pagination;
  }

  // Final response structure
  res.data = {
    message: response.message,
    transaction: response.transaction || undefined,
    transactions:
      response.transactions.length > 0 ? response.transactions : undefined,
    pagination: response.pagination || undefined,
  };

  console.log('Serialized response:', JSON.stringify(res.data, null, 2));
  next();
};

module.exports = {
  serialize,
};
