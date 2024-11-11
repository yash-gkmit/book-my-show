const jwt = require('jsonwebtoken');
const { throwCustomError } = require('./common.helper');

exports.generateToken = payload => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  } catch {
    throwCustomError('Token generation failed', 401);
  }
};

exports.verifyToken = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(new Error('Invalid or expired token'));
      } else {
        resolve(decoded);
      }
    });
  });
};
