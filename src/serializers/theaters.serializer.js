const serialize = (req, res, next) => {
  let { theater, data: theaters, pagination } = res.data || {};

  const response = {
    theater: null,
    theaters: [],
    pagination: {},
  };

  if (!res.data.data) {
    theater = res.data;
  }

  if (Array.isArray(theaters) && theaters.length > 0) {
    response.theaters = theaters.map(theater => ({
      id: theater.id,
      name: theater.name,
      address: theater.address,
      createdAt: theater.created_at,
      updatedAt: theater.updated_at,
    }));

    if (pagination) {
      response.pagination = pagination;
    }
  } else {
    response.theater = {
      id: theater?.id,
      name: theater?.name,
      address: theater?.address,
      createdAt: theater?.created_at,
      updatedAt: theater?.updated_at,
    };
  }

  if (!response.theater && response.theaters.length === 0) {
    response.message = 'No theater data found!';
  }

  if (response.theaters.length > 0) {
    delete response.theater;
  }

  if (!pagination || Object.keys(pagination).length === 0) {
    delete response.pagination;
  }

  res.data = {
    theater: response.theater || undefined,
    theaters: response.theaters.length > 0 ? response.theaters : undefined,
    pagination: response.pagination || undefined,
  };
  next();
};

const movieSerialize = (req, res, next) => {
  let { data: movies, pagination } = res.data || {};

  const response = {
    movie: null,
    movies: [],
    pagination: {},
  };

  if (Array.isArray(movies) && movies?.length > 0) {
    response.movies = movies.map(movie => ({
      id: movie?.id,
      name: movie?.name,
      summary: movie?.summary,
      releaseDate: movie?.release_date,
      castMemberList: movie?.cast_member_list,
      genre: movie?.genre,
      language: movie?.language,
      category: movie?.category,
      poster: movie?.poster,
      trailer: movie?.trailer,
      createdAt: movie?.created_at,
      updatedAt: movie?.updated_at,
    }));

    if (pagination) {
      response.pagination = pagination;
    }
  }

  if (!response.movie && response.movies.length === 0) {
    response.message = 'No movie data found!';
  }

  if (response.movies.length > 0) {
    delete response.movie;
  }

  if (!pagination || Object.keys(pagination).length === 0) {
    delete response.pagination;
  }

  res.data = {
    message: response.message,
    movie: response.movie || undefined,
    movies: response.movies.length > 0 ? response.movies : undefined,
    pagination: response.pagination || undefined,
  };

  next();
};

module.exports = {
  serialize,
  movieSerialize,
};
