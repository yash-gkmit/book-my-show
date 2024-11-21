const serialize = (req, res, next) => {
  console.log(
    'res.data before serialization:',
    JSON.stringify(res.data, null, 2),
  );

  let { message, show, shows, pagination } = res.data || {};

  const response = {
    message: message || 'Shows fetched successfully!',
    show: null,
    shows: [],
    pagination: {},
  };

  // Handle single show case
  if (!res.data.data && !show) {
    show = res.data;
  }

  // Populate single show
  if (show) {
    response.show = {
      id: show?.id,
      movieId: show?.movie_id,
      theaterId: show?.theater_id,
      showTime: show?.show_time,
      availableSeats: show.available_seats || 0,
      type: show?.type,
      price: show?.price,
      movie: show?.movie && {
        id: show?.movie?.id,
        name: show?.movie?.name,
        summary: show?.movie?.summary,
        release_date: show?.movie?.release_date,
        castMemberList: show?.movie?.cast_member_list,
        genre: show?.movie?.genre,
        language: show?.movie?.language,
        category: show?.movie?.category,
        poster: show?.movie?.poster,
        trailer: show?.movie?.trailer,
      },
      theater: show?.theater && {
        id: show?.theater?.id,
        cityId: show?.theater?.city_id,
        name: show?.theater?.name,
        address: show?.theater?.address,
      },
    };
  }

  // Populate multiple shows
  if (Array.isArray(shows?.data) && shows?.data?.length > 0) {
    response.shows = shows.data.map(show => ({
      id: show?.id,
      movieId: show?.movie_id,
      theaterId: show?.theater_id,
      showTime: show?.show_time,
      availableSeats: show.available_seats || 0,
      type: show?.type,
      price: show?.price,
      movie: {
        id: show?.movie?.id,
        name: show?.movie?.name,
        summary: show?.movie?.summary,
        releaseDate: show?.movie?.release_date,
        castMemberList: show?.movie?.cast_member_list,
        genre: show?.movie?.genre,
        language: show?.movie?.language,
        category: show?.movie?.category,
        poster: show?.movie?.poster,
        trailer: show?.movie?.trailer,
      },
      theater: show.theater && {
        id: show?.theater?.id,
        cityId: show?.theater?.city_id,
        name: show?.theater?.name,
        address: show?.theater?.address,
      },
    }));

    if (pagination) {
      response.pagination = pagination;
    }
  }

  // Handle case where no data is found
  if (!response.show && response.shows.length === 0) {
    response.message = 'No show data found!';
  }

  // Adjust response for getAll
  if (response.shows.length > 0) {
    delete response.show;
  }

  // Remove pagination if no data is available
  if (!pagination || Object.keys(pagination).length === 0) {
    delete response.pagination;
  }

  // Final response structure
  res.data = {
    message: response.message,
    show: response.show || undefined,
    shows: response.shows.length > 0 ? response.shows : undefined,
    pagination: response.pagination || undefined,
  };

  console.log('Serialized response:', JSON.stringify(res.data, null, 2));
  next();
};

module.exports = {
  serialize,
};
