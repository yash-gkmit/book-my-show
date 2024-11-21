const serialize = (req, res, next) => {
  console.log(
    'res.data before serialization:',
    JSON.stringify(res.data, null, 2),
  );

  let { message, movie, movies, pagination } = res.data || {};

  const response = {
    message: message || 'Movies fetched successfully!',
    movie: null,
    movies: [],
    pagination: {},
  };

  // Handle single movie case
  if (!res.data.data && !movie) {
    movie = res.data;
  }

  // Populate single movie
  if (movie) {
    response.movie = {
      id: movie.id || null,
      name: movie.name || null,
      summary: movie.summary || null,
      releaseDate: movie.release_date || null,
      castMemberList: Array.isArray(movie.cast_member_list)
        ? movie.cast_member_list
        : [],
      genre: movie.genre || null,
      language: movie.language || null,
      category: movie.category || null,
      poster: movie.poster || null,
      trailer: movie.trailer || null,
    };
  }

  //Populate multiple movies
  if (Array.isArray(movies) && movies.length > 0) {
    response.movies = movies.map(movie => ({
      id: movie.id || null,
      name: movie.name || null,
      summary: movie.summary || null,
      releaseDate: movie.release_date || null,
      castMemberList: Array.isArray(movie.cast_member_list)
        ? movie.cast_member_list
        : [],
      genre: movie.genre || null,
      language: movie.language || null,
      category: movie.category || null,
      poster: movie.poster || null,
      trailer: movie.trailer || null,
    }));

    if (pagination) {
      response.pagination = pagination;
    }
  }

  // Handle case where no data is found
  if (!response.movie && response.movies.length === 0) {
    response.message = 'No movie data found!';
  }

  // Adjust response for getAll
  if (response.movies.length > 0) {
    delete response.movie;
  }

  // Remove pagination if no data is available
  if (!pagination || Object.keys(pagination).length === 0) {
    delete response.pagination;
  }

  // Final response structure
  res.data = {
    message: response.message,
    movie: response.movie || undefined,
    movies: response.movies.length > 0 ? response.movies : undefined,
    pagination: response.pagination || undefined,
  };

  console.log('Serialized response:', JSON.stringify(res.data, null, 2));
  next();
};

module.exports = {
  serialize,
};
