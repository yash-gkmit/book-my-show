const serialize = (req, res, next) => {
  const { data } = res;

  let response = {};

  if (data) {
    const { data: cities, pagination } = data;

    if (Array.isArray(cities)) {
      response.cities = cities?.map(city => ({
        id: city?.id,
        name: city?.name,
        createdAt: city?.created_at,
        updatedAt: city?.updated_at,
      }));
      if (pagination) {
        response.pagination = pagination;
      }
    } else {
      response.city = {
        id: data?.id,
        name: data?.name,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
      };
    }
  }

  res.data = response;

  next();
};

const theaterSerialize = (req, res, next) => {
  const { data } = res;

  const response = {};

  if (data) {
    const { data: theaters, pagination } = data;

    if (Array.isArray(theaters)) {
      response.theaters = theaters?.map(theater => ({
        id: theater?.id,
        name: theater?.name,
        address: theater?.address,
        createdAt: theater?.created_at,
        updatedAt: theater?.updated_at,
      }));
    }
    if (pagination) {
      response.pagination = pagination;
    }
  }
  res.data = response;

  next();
};

module.exports = {
  theaterSerialize,
  serialize,
};
