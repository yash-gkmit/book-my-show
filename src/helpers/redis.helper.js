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
