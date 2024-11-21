const serialize = (req, res, next) => {
  const { message, theaters } = res.data || {};

  console.log('res.data in serializer:', res.data); // Debugging: Log the response data

  let response = {
    message: message || 'Data fetched successfully!',
    theaters: [],
    pagination: {},
  };

  // Handle the case where theaters is an array
  if (theaters && Array.isArray(theaters.data) && theaters.data.length > 0) {
    response.theaters = theaters.data.map(theater => {
      const { id, name, address } = theater;
      return { id, name, address };
    });

    if (theaters.pagination) {
      response.pagination = theaters.pagination;
    }
    response.message = response.message || 'Theater data fetched successfully';
  }

  // Handle the case where a single theater is being fetched
  else if (theaters && theaters.data && theaters.data[0]) {
    const { id, name, address } = theaters.data[0];
    response.theater = { id, name, address };
    response.message = response.message || 'Theater fetched successfully';
  }

  // If no theater data found, set the appropriate message
  else {
    response.message = 'No theater data found!';
  }

  res.data = response;
  next();
};

module.exports = {
  serialize,
};
