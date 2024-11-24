const serialize = (req, res, next) => {
  let { movie, movies, pagination } = res.data || {};

  const response = {
    movie: null,
    movies: [],
    pagination: {},
  };

  console.log(res.data);
  console.log(res.pagination);

  if (!res.data.data && !movie) {
    movie = res.data;
  }

  if (movie) {
    response.movie = {
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
    };
  }

  if (Array.isArray(movies) && movies.length > 0) {
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
    movie: response.movie || undefined,
    movies: response.movies.length > 0 ? response.movies : undefined,
    pagination: response.pagination || undefined,
  };

  console.log('Serialized response:', JSON.stringify(res.data, null, 2));
  next();
};

const theaterSerialize = (req, res, next) => {
  const { data } = res;
  const theaters = data;
  const response = {
    theaters: [],
  };

  if (Array.isArray(theaters) && theaters.length > 0) {
    response.theaters = theaters.map(theater => ({
      id: theater?.id,
      cityId: theater?.city_id,
      name: theater?.name,
      address: theater?.address,
      createdAt: theater?.created_at,
      updatedAt: theater?.updated_at,
    }));
  }

  if (response.theaters.length === 0) {
    response.message = 'No theater data found!';
  }

  res.data = {
    theaters: response.theaters.length > 0 ? response.theaters : undefined,
  };
  next();
};

module.exports = {
  serialize,
  theaterSerialize,
};
