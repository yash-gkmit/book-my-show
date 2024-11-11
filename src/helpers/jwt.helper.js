const jwt = require('jsonwebtoken');
const { throwCustomError } = require('./common.helper');

exports.generateToken = payload => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  } catch {
    throwCustomError('Token generation failed', 401);
  }
};
