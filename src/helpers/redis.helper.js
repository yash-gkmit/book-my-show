const redisClient = require('../config/redis');

// Set OTP in Redis
exports.setOtpInRedis = async (email, otp) => {
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

exports.getOtpFromRedis = async email => {
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

exports.deleteOtpFromRedis = email => {
  redisClient.del(email, (err, response) => {
    if (err) console.error(`Error deleting OTP from Redis: ${err}`);
    else console.log(`OTP deleted for ${email}: ${response}`);
  });
};
