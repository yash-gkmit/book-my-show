const serialize = (req, res, next) => {
  let { transaction, data: transactions, pagination } = res.data || {};

  const response = {
    transaction: null,
    transactions: [],
    pagination: {},
  };
  console.log(transaction);

  if (!res.data.data && !transaction) {
    transaction = res.data;
  }

  if (transaction) {
    response.transaction = {
      id: transaction?.id,
      bookingId: transaction?.booking_id,
      userId: transaction?.user_id,
      status: transaction?.status,
      amount: transaction?.amount,
      GST: transaction?.GST,
      CGST: transaction?.CGST,
      IGST: transaction?.IGST,
      SGST: transaction?.SGST,
      createdAt: transaction?.created_at,
      updatedAt: transaction?.updated_at,
      booking: transaction?.booking && {
        id: transaction?.booking?.id,
        userId: transaction?.booking?.user_id,
        showId: transaction?.booking?.show_id,
        numberOfSeats: transaction?.booking?.number_of_seats,
        bookingDate: transaction?.booking?.booking_date,
        status: transaction?.booking?.booking_status,
        totalAmount: transaction?.booking?.total_amount,
        createdAt: transaction?.booking?.created_at,
        updatedAt: transaction?.booking?.updated_at,
        show: transaction?.booking?.show && {
          id: transaction?.booking?.show?.id,
          movieId: transaction?.booking?.show?.movie_id,
          theaterId: transaction?.booking?.show?.theater_id,
          time: transaction?.booking?.show?.time,
          availableSeats: transaction.booking.show.available_seats || 0,
          type: transaction?.booking?.show?.type,
          price: transaction?.booking?.show?.price,
          createdAt: transaction?.booking?.show?.created_at,
          updatedAt: transaction?.booking?.show?.updated_at,
          movie: transaction?.booking?.show?.movie && {
            id: transaction?.booking?.show?.movie?.id,
            name: transaction?.booking?.show?.movie?.name,
            summary: transaction?.booking?.show?.movie?.summary,
            releaseDate: transaction?.booking?.show?.movie?.release_date,
            casts: transaction?.booking?.show?.movie?.casts,
            genre: transaction?.booking?.show?.movie?.genre,
            language: transaction?.booking?.show?.movie?.language,
            category: transaction?.booking?.show?.movie?.category,
            poster_url: transaction?.booking?.show?.movie?.poster_url,
            trailer_url: transaction?.booking?.show?.movie?.trailer_url,
            createdAt: transaction?.booking?.show?.movie?.created_at,
            updatedAt: transaction?.booking?.show?.movie?.updated_at,
          },
        },
      },
    };
  }

  if (Array.isArray(transactions) && transactions?.length > 0) {
    response.transactions = transactions.map(transaction => ({
      id: transaction?.id,
      bookingId: transaction?.booking_id,
      userId: transaction?.user_id,
      status: transaction?.status,
      amount: transaction?.amount,
      GST: transaction?.GST,
      CGST: transaction?.CGST,
      IGST: transaction?.IGST,
      SGST: transaction?.SGST,
      createdAt: transaction?.created_at,
      updatedAt: transaction?.updated_at,
      booking: transaction?.booking && {
        id: transaction?.booking?.id,
        userId: transaction?.booking?.user_id,
        showId: transaction?.booking?.show_id,
        numberOfSeats: transaction?.booking?.number_of_seats,
        bookingDate: transaction?.booking?.booking_date,
        status: transaction?.booking?.status,
        totalAmount: transaction?.booking?.total_amount,
        createdAt: transaction?.booking?.created_at,
        updatedAt: transaction?.booking?.updated_at,
        show: transaction?.booking?.show && {
          id: transaction?.booking?.show?.id,
          movieId: transaction?.booking?.show?.movie_id,
          theaterId: transaction?.booking?.show?.theater_id,
          showTime: transaction?.booking?.show?.time,
          availableSeats: transaction?.booking?.show?.available_seats,
          type: transaction?.booking?.show?.type,
          price: transaction?.booking?.show?.price,
          createdAt: transaction?.booking?.show?.created_at,
          updatedAt: transaction?.booking?.show?.updated_at,
          movie: transaction?.booking?.show?.movie && {
            id: transaction?.booking?.show?.movie?.id,
            name: transaction?.booking?.show?.movie?.name,
            summary: transaction?.booking?.show?.movie?.summary,
            releaseDate: transaction?.booking?.show?.movie?.release_date,
            casts: transaction?.booking?.show?.movie?.casts,
            genre: transaction?.booking?.show?.movie?.genre,
            language: transaction?.booking?.show?.movie?.language,
            category: transaction?.booking?.show?.movie?.category,
            poster_url: transaction?.booking?.show?.movie?.poster_url,
            trailer_url: transaction?.booking?.show?.movie?.trailer_url,
            createdAt: transaction?.booking?.show?.movie?.created_at,
            updatedAt: transaction?.booking?.show?.movie?.updated_at,
          },
        },
      },
    }));

    if (pagination) {
      response.pagination = pagination;
    }
  }

  if (!response.transaction && response.transactions.length === 0) {
    response.message = 'No transaction data found!';
  }

  if (response.transactions.length > 0) {
    delete response.transaction;
  }

  if (!pagination || Object.keys(pagination).length === 0) {
    delete response.pagination;
  }

  res.data = {
    transaction: response.transaction || undefined,
    transactions:
      response.transactions.length > 0 ? response.transactions : undefined,
    pagination: response.pagination || undefined,
  };

  next();
};

module.exports = {
  serialize,
};
