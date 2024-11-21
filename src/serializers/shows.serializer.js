const serialize = (req, res, next) => {
  let { show, shows, pagination } = res.data || {};

  const response = {
    show: null,
    shows: [],
    pagination: {},
  };

  if (!res.data.data && !show) {
    show = res.data;
  }

  if (show) {
    response.show = {
      id: show?.id,
      movieId: show?.movie_id,
      theaterId: show?.theater_id,
      showTime: show?.show_time,
      availableSeats: show.available_seats || 0,
      type: show?.type,
      price: show?.price,
      createdAt: show?.created_at,
      updatedAt: show?.updated_at,
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
        createdAt: show?.movie?.created_at,
        updatedAt: show?.movie?.updated_at,
      },
      theater: show?.theater && {
        id: show?.theater?.id,
        cityId: show?.theater?.city_id,
        name: show?.theater?.name,
        address: show?.theater?.address,
        createdAt: show?.theater?.created_at,
        updatedAt: show?.theater?.updated_at,
      },
    };
  }

  if (Array.isArray(shows?.data) && shows?.data?.length > 0) {
    response.shows = shows.data.map(show => ({
      id: show?.id,
      movieId: show?.movie_id,
      theaterId: show?.theater_id,
      showTime: show?.show_time,
      availableSeats: show.available_seats || 0,
      type: show?.type,
      price: show?.price,
      createdAt: show?.created_at,
      updatedAt: show?.updated_at,
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
        createdAt: show?.movie?.created_at,
        updatedAt: show?.movie?.updated_at,
      },
      theater: show.theater && {
        id: show?.theater?.id,
        cityId: show?.theater?.city_id,
        name: show?.theater?.name,
        address: show?.theater?.address,
        createdAt: show?.theater?.created_at,
        updatedAt: show?.theater?.updated_at,
      },
    }));

    if (pagination) {
      response.pagination = pagination;
    }
  }

  if (!response.show && response.shows.length === 0) {
    response.message = 'No show data found!';
  }

  if (response.shows.length > 0) {
    delete response.show;
  }

  if (!pagination || Object.keys(pagination).length === 0) {
    delete response.pagination;
  }

  res.data = {
    show: response.show || undefined,
    shows: response.shows.length > 0 ? response.shows : undefined,
    pagination: response.pagination || undefined,
  };

  next();
};

module.exports = {
  serialize,
};
