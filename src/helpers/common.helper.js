function throwCustomError(message, statusCode = 400) {
  const err = message;
  err.statusCode = statusCode;
  throw err;
}

function errorHandler(req, res, message, statusCode = 400) {
  message = message ? message : 'Something went wrong';

  res.status(statusCode).json({
    message,
  });
}

function responseHandler(req, res) {
  const response = {
    message: res.message || 'success',
    data: res.data,
  };

  res.status(res.statusCode).json(response);
}

module.exports = { throwCustomError, errorHandler, responseHandler };
