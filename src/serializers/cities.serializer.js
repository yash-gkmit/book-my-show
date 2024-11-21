const serialize = (req, res, next) => {
  const { message, city, cities } = res.data || {};

  let response = {
    message: message || 'Data fetched successfully!',
    city: {},
    cities: [],
    pagination: {},
  };

  if (city && city.dataValues) {
    const { id, name } = city.dataValues;
    response.city = { id, name };
    response.message = response.message || 'City created/updated successfully';
  }

  if (city && !city.dataValues) {
    const { id, name } = city;
    response.city = { id, name };
    response.message = response.message || 'City fetched successfully';
  }

  if (cities && cities.data && Array.isArray(cities.data)) {
    response.cities = cities.data.map(city => {
      const { id, name } = city.dataValues || city;
      return { id, name };
    });

    if (cities.pagination) {
      response.pagination = cities.pagination;
    }
  }

  if (!response.city.id && !response.cities.length) {
    response.message = 'No city data found!';
  }

  if (cities && cities.data) {
    delete response.city;
  }

  if (!cities || !cities.data) {
    delete response.cities;
    delete response.pagination;
  }

  res.data = response;

  next();
};

module.exports = {
  serialize,
};
