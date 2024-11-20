const serialize = (req, res, next) => {
  let { rows } = res.data || {};
  let response = [];

  if (!rows) {
    rows = [res.data];
  }

  for (const user of rows) {
    const data = {};
    data.id = user.id;
    data.name = user.name;
    data.email = user.email;
    data.phone = user.phone;

    response.push(data);
  }

  if (!res.data.rows) {
    res.data = response[0];
  } else {
    res.data.rows = response;
  }

  next();
};

module.exports = {
  serialize,
};
