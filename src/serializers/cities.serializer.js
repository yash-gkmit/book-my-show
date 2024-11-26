const serialize = (req, res, next) => {
  const { data } = res;

  const response = {
    cities: [],
    pagination: null,
  };

  if (data) {
    const { data: items, pagination } = data;

    if (Array.isArray(items)) {
      response.cities = items.map(city => ({
        id: city.id,
        name: city.name,
        createdAt: city.created_at,
        updatedAt: city.updated_at,
      }));
    } else {
      response.cities = {
        id: data.id,
        name: data.name,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
    response.pagination = pagination || null;
  }
  res.data = response;

  next();
};

const theaterSerialize = (req, res, next) => {
  const { theaters } = res.data || {};

  let response = {
    theaters: [],
    pagination: {},
  };

  if (theaters && Array.isArray(theaters.data) && theaters.data.length > 0) {
    response.theaters = theaters.data.map(theater => {
      const { id, name, address, created_at, updated_at } = theater;
      return {
        id,
        name,
        address,
        createdAt: created_at,
        updatedAt: updated_at,
      };
    });

    if (theaters.pagination) {
      response.pagination = theaters.pagination;
    }
  } else if (theaters && theaters.data && theaters.data[0]) {
    const { id, name, address, created_at, updated_at } = theaters.data[0];
    response.theater = {
      id,
      name,
      address,
      createdAt: created_at,
      updatedAt: updated_at,
    };
  } else {
    response.message = 'No theater data found!';
  }

  res.data = response;
  next();
};

module.exports = {
  theaterSerialize,
  serialize,
};
