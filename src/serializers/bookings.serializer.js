const serialize = (req, res, next) => {
  console.log(
    'res.data before serialization:',
    JSON.stringify(res.data, null, 2),
  );

  let { message, booking, data: bookings, pagination } = res.data || {};
  console.log('CVBNM', bookings);

  const response = {
    message: message || 'Bookings fetched successfully!',
    booking: null,
    bookings: [],
    pagination: {},
  };

  // Handle single booking case
  if (!res.data.data && !booking) {
    booking = res.data;
  }

  // Populate single booking
  if (booking) {
    response.booking = {
      id: booking?.id,
      userId: booking?.user_id,
      showId: booking?.show_id,
      numberOfSeat: booking?.number_of_seat,
      bookingDate: booking?.booking_date,
      bookingStatus: booking?.booking_status,
      totalAmount: booking?.total_amount,
      show: booking?.show && {
        id: booking?.show?.id,
        movieId: booking?.show?.movie_id,
        theaterId: booking?.show?.theater_id,
        showTime: booking?.show?.show_time,
        availableSeats: booking?.show?.available_seats,
        type: booking?.show?.type,
        price: booking?.show?.price,
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
        },
      },
    };
  }

  // Populate multiple bookings
  if (Array.isArray(bookings) && bookings?.length > 0) {
    response.bookings = bookings.map(booking => ({
      id: booking?.id,
      userId: booking?.user_id,
      showId: booking?.show_id,
      numberOfSeat: booking?.number_of_seat,
      bookingDate: booking?.booking_date,
      bookingStatus: booking?.booking_status,
      totalAmount: booking?.total_amount,
      show: booking?.show && {
        id: booking?.show.id,
        movieId: booking?.show?.movie_id,
        theaterId: booking?.show?.theater_id,
        showTime: booking?.show?.show_time,
        availableSeats: booking?.show?.available_seats,
        type: booking?.show?.type,
        price: booking?.show?.price,
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
        },
      },
    }));

    if (pagination) {
      response.pagination = pagination;
    }
  }

  // Handle case where no data is found
  if (!response.booking && response.bookings.length === 0) {
    response.message = 'No booking data found!';
  }

  // Adjust response for getAll
  if (response.bookings.length > 0) {
    delete response.booking;
  }

  // Remove pagination if no data is available
  if (!pagination || Object.keys(pagination).length === 0) {
    delete response.pagination;
  }

  // Final response structure
  res.data = {
    message: response.message,
    booking: response.booking || undefined,
    bookings: response.bookings.length > 0 ? response.bookings : undefined,
    pagination: response.pagination || undefined,
  };

  console.log('Serialized response:', JSON.stringify(res.data, null, 2));
  next();
};

module.exports = {
  serialize,
};
