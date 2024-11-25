const serialize = (req, res, next) => {
  const { data } = res;

  const response = {
    roles: [],
  };

  if (data) {
    const { data: items } = data;

    if (Array.isArray(items)) {
      response.roles = items.map(role => ({
        id: role.id,
        name: role.name,
        createdAt: role.created_at,
        updatedAt: role.updated_at,
      }));
    } else {
      response.roles = {
        id: data.id,
        name: data.name,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  }
  res.data = response;

  next();
};

module.exports = {
  serialize,
};
