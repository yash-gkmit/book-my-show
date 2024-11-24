const serialize = (req, res, next) => {
  let { booking, data: bookings, pagination } = res.data || {};

  const response = {
    booking: null,
    bookings: [],
    pagination: {},
  };

  if (!res.data.data && !booking) {
    booking = res.data;
  }

  if (booking) {
    response.booking = {
      id: booking?.id,
      userId: booking?.user_id,
      showId: booking?.show_id,
      numberOfSeat: booking?.number_of_seats,
      bookingDate: booking?.booking_date,
      bookingStatus: booking?.booking_status,
      totalAmount: booking?.total_amount,
      createdAt: booking?.created_at,
      updatedAt: booking?.updated_at,
      show: booking?.show && {
        id: booking?.show?.id,
        movieId: booking?.show?.movie_id,
        theaterId: booking?.show?.theater_id,
        showTime: booking?.show?.show_time,
        availableSeats: booking?.show?.available_seats,
        type: booking?.show?.type,
        price: booking?.show?.price,
        createdAt: booking?.show?.created_at,
        updatedAt: booking?.show?.updated_at,
        movie: booking?.show?.movie && {
          id: booking?.show.movie.id,
          name: booking?.show?.movie?.name,
          summary: booking?.show?.movie?.summary,
          releaseDate: booking?.show?.movie?.release_date,
          castMemberList: show?.movie?.cast_member_list,
          genre: booking?.show?.movie?.genre,
          language: booking?.show?.movie?.language,
          category: booking?.show?.movie?.category,
          poster: booking?.show?.movie?.poster,
          trailer: booking?.show?.movie?.trailer,
          createdAt: booking?.show?.movie?.created_at,
          updatedAt: booking?.show?.movie?.updated_at,
        },
      },
    };
  }

  if (Array.isArray(bookings) && bookings?.length > 0) {
    response.bookings = bookings.map(booking => ({
      id: booking?.id,
      userId: booking?.user_id,
      showId: booking?.show_id,
      numberOfSeat: booking?.number_of_seats,
      bookingDate: booking?.booking_date,
      bookingStatus: booking?.booking_status,
      totalAmount: booking?.total_amount,
      createdAt: booking?.created_at,
      updatedAt: booking?.updated_at,
      show: booking?.show && {
        id: booking?.show.id,
        movieId: booking?.show?.movie_id,
        theaterId: booking?.show?.theater_id,
        showTime: booking?.show?.show_time,
        availableSeats: booking?.show?.available_seats,
        type: booking?.show?.type,
        price: booking?.show?.price,
        createdAt: booking?.show?.created_at,
        updatedAt: booking?.show?.updated_at,
        movie: booking?.show?.movie && {
          id: booking?.show?.movie.id,
          name: booking?.show?.movie.name,
          summary: booking?.show?.movie.summary,
          releaseDate: booking?.show?.movie?.release_date,
          castMemberList: booking?.show?.movie?.cast_member_list,
          genre: booking?.show?.movie?.genre,
          language: booking?.show?.movie?.language,
          category: booking?.show?.movie?.category,
          poster: booking?.show?.movie?.poster,
          trailer: booking?.show?.movie?.trailer,
          createdAt: booking?.show?.movie?.created_at,
          updatedAt: booking?.show?.movie?.updated_at,
        },
      },
    }));

    if (pagination) {
      response.pagination = pagination;
    }
  }

  if (!response.booking && response.bookings.length === 0) {
    response.message = 'No booking data found!';
  }

  if (response.bookings.length > 0) {
    delete response.booking;
  }

  if (!pagination || Object.keys(pagination).length === 0) {
    delete response.pagination;
  }

  res.data = {
    booking: response.booking || undefined,
    bookings: response.bookings.length > 0 ? response.bookings : undefined,
    pagination: response.pagination || undefined,
  };

  next();
};

module.exports = {
  serialize,
};
