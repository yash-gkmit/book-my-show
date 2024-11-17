const redisClient = require('../config/redis');

const setOtpInRedis = async (email, otp) => {
  try {
    await redisClient.set(email, otp, {
      EX: 300,
    });
    console.log(
      `OTP for ${email} stored in Redis with expiration of 5 minutes`,
    );
  } catch (error) {
    console.error('Error setting OTP in Redis:', error);
  }
};

const getOtpFromRedis = async email => {
  try {
    const otp = await redisClient.get(email);
    console.log(otp);
    if (!otp) {
      console.log(`No OTP found for email: ${email}`);
    }

    console.log('Retrieved OTP from Redis:', otp);
    return otp;
  } catch (error) {
    console.error('Error retrieving OTP from Redis:', error);
    throw new Error('Failed to retrieve OTP from Redis');
  }
};

const deleteOtpFromRedis = email => {
  redisClient.del(email, (err, response) => {
    if (err) console.error(`Error deleting OTP from Redis: ${err}`);
    else console.log(`OTP deleted for ${email}: ${response}`);
  });
};

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
  setOtpInRedis,
  getOtpFromRedis,
  deleteOtpFromRedis,
  addTokenToBlacklist,
  isTokenBlacklisted,
};
