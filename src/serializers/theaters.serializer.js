const serialize = (req, res, next) => {
  console.log(
    'res.data before serialization:',
    JSON.stringify(res.data, null, 2),
  );

  let { message, theater, data: theaters, pagination } = res.data || {};

  const response = {
    message: message || 'Data fetched successfully!',
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
    }));

    if (pagination) {
      response.pagination = pagination;
    }
  } else {
    response.theater = {
      id: theater.id,
      name: theater.name,
      address: theater.address,
    };
  }

  // Handle case where no data is found
  if (!response.theater && response.theaters.length === 0) {
    response.message = 'No theater data found!';
  }

  // Adjust response for getAll
  if (response.theaters.length > 0) {
    delete response.theater;
  }

  // Remove pagination if no data is available
  if (!pagination || Object.keys(pagination).length === 0) {
    delete response.pagination;
  }

  // Final response structure
  res.data = {
    message: response.message,
    theater: response.theater || undefined,
    theaters: response.theaters.length > 0 ? response.theaters : undefined,
    pagination: response.pagination || undefined,
  };

  console.log('Serialized response:', JSON.stringify(res.data, null, 2));
  next();
};

module.exports = {
  serialize,
};
