const serialize = (req, res, next) => {
  const { data } = res;

  const response = {
    city: {},
    cities: [],
    pagination: null,
  };

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
  // const { data: theaters } = res.data || {};

  // let response = {
  //   theaters: [],
  //   pagination: {},
  // };
  // if (!res.data.data) {
  //   theater = res.data;
  // }

  // if (theaters && Array.isArray(theaters?.data) && theaters?.data?.length > 0) {
  //   response.theaters = theaters?.data?.map(theater => {
  //     const { id, name, address, created_at, updated_at } = theater;
  //     return {
  //       id,
  //       name,
  //       address,
  //       createdAt: created_at,
  //       updatedAt: updated_at,
  //     };
  //   });

  //   if (theaters.pagination) {
  //     response.pagination = theaters.pagination;
  //   }
  // } else if (theaters && theaters?.data && theaters?.data[0]) {
  //   const { id, name, address, created_at, updated_at } = theaters?.data[0];
  //   response.theater = {
  //     id,
  //     name,
  //     address,
  //     createdAt: created_at,
  //     updatedAt: updated_at,
  //   };
  // } else {
  //   response.message = 'No theater data found!';
  // }

  // res.data = response;
  // next();

  const { data } = res;

  const response = {
    theaters: [],
    pagination: null,
  };

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
    res.pagination = theaters.pagination;
  }
  res.data = response;

  next();
};

module.exports = {
  theaterSerialize,
  serialize,
};
