const redisClient = require('../config/redis');

const addTokenToBlacklist = async (token, expiresIn) => {
  try {
    await redisClient.set(token, 'blacklisted', 'EX', expiresIn);
    return 'Token added to blacklist';
  } catch (err) {
    console.error('Error adding token to blacklist', err);
    throw err;
  }
};

const isTokenBlacklisted = async token => {
  try {
    const result = await redisClient.get(token);
    return result === 'blacklisted';
  } catch (err) {
    console.error('Error checking if token is blacklisted', err);
    throw err;
  }
};

module.exports = {
  addTokenToBlacklist,
  isTokenBlacklisted,
};
