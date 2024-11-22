const redisClient = require('../../src/config/redis');
const {
  setOtpInRedis,
  getOtpFromRedis,
  deleteOtpFromRedis,
  addTokenToBlacklist,
  isTokenBlacklisted,
} = require('../../src/helpers/redis.helper');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/config/redis');

describe('Redis Utils', () => {
  describe('setOtpInRedis', () => {
    it('should set OTP in Redis with an expiration of 5 minutes', async () => {
      const email = faker.internet.email();
      const otp = faker.number.int({ min: 100000, max: 999999 }).toString();

      redisClient.set.mockResolvedValue('OK');

      await setOtpInRedis(email, otp);

      expect(redisClient.set).toHaveBeenCalledWith(email, otp, { EX: 300 });
    });

    it('should log an error if setting OTP fails', async () => {
      const email = faker.internet.email();
      const otp = faker.number.int({ min: 100000, max: 999999 }).toString();
      const error = new Error('Redis set failed');

      redisClient.set.mockRejectedValue(error);

      const consoleErrorMock = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await setOtpInRedis(email, otp);

      expect(consoleErrorMock).toHaveBeenCalledWith(
        'Error setting OTP in Redis:',
        error,
      );

      consoleErrorMock.mockRestore();
    });
  });

  describe('getOtpFromRedis', () => {
    it('should retrieve OTP from Redis', async () => {
      const email = faker.internet.email();
      const otp = faker.number.int({ min: 100000, max: 999999 }).toString();

      redisClient.get.mockResolvedValue(otp);

      const retrievedOtp = await getOtpFromRedis(email);

      expect(redisClient.get).toHaveBeenCalledWith(email);
      expect(retrievedOtp).toBe(otp);
    });

    it('should log a message if OTP is not found', async () => {
      const email = faker.internet.email();

      redisClient.get.mockResolvedValue(null);

      const consoleLogMock = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      const retrievedOtp = await getOtpFromRedis(email);

      expect(redisClient.get).toHaveBeenCalledWith(email);
      expect(retrievedOtp).toBeNull();
      expect(consoleLogMock).toHaveBeenCalledWith(
        `No OTP found for email: ${email}`,
      );

      consoleLogMock.mockRestore();
    });

    it('should throw an error if Redis get fails', async () => {
      const email = faker.internet.email();
      const error = new Error('Redis get failed');

      redisClient.get.mockRejectedValue(error);

      await expect(getOtpFromRedis(email)).rejects.toThrow(
        'Failed to retrieve OTP from Redis',
      );
    });
  });

  describe('deleteOtpFromRedis', () => {
    it('should delete OTP from Redis', () => {
      const email = faker.internet.email();

      redisClient.del.mockImplementation((key, callback) => callback(null, 1));

      const consoleLogMock = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      deleteOtpFromRedis(email);

      expect(redisClient.del).toHaveBeenCalledWith(email, expect.any(Function));
      expect(consoleLogMock).toHaveBeenCalledWith(
        `OTP deleted for ${email}: 1`,
      );

      consoleLogMock.mockRestore();
    });

    it('should log an error if deletion fails', () => {
      const email = faker.internet.email();
      const error = new Error('Redis del failed');

      redisClient.del.mockImplementation((key, callback) => callback(error));

      const consoleErrorMock = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      deleteOtpFromRedis(email);

      expect(redisClient.del).toHaveBeenCalledWith(email, expect.any(Function));
      expect(consoleErrorMock).toHaveBeenCalledWith(
        `Error deleting OTP from Redis: ${error}`,
      );

      consoleErrorMock.mockRestore();
    });
  });

  describe('addTokenToBlacklist', () => {
    it('should add token to blacklist with expiration', async () => {
      const token = faker.string.uuid();
      const expiresIn = 3600;

      redisClient.set.mockResolvedValue('OK');

      const result = await addTokenToBlacklist(token, expiresIn);

      expect(redisClient.set).toHaveBeenCalledWith(
        token,
        'blacklisted',
        'EX',
        expiresIn,
      );
      expect(result).toBe('Token added to blacklist');
    });

    it('should throw an error if adding token to blacklist fails', async () => {
      const token = faker.string.uuid();
      const expiresIn = 3600;
      const error = new Error('Redis set failed');

      redisClient.set.mockRejectedValue(error);

      await expect(addTokenToBlacklist(token, expiresIn)).rejects.toThrow(
        error,
      );
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true if token is blacklisted', async () => {
      const token = faker.string.uuid();

      redisClient.get.mockResolvedValue('blacklisted');

      const isBlacklisted = await isTokenBlacklisted(token);

      expect(redisClient.get).toHaveBeenCalledWith(token);
      expect(isBlacklisted).toBe(true);
    });

    it('should return false if token is not blacklisted', async () => {
      const token = faker.string.uuid();

      redisClient.get.mockResolvedValue(null);

      const isBlacklisted = await isTokenBlacklisted(token);

      expect(redisClient.get).toHaveBeenCalledWith(token);
      expect(isBlacklisted).toBe(false);
    });

    it('should throw an error if Redis get fails', async () => {
      const token = faker.string.uuid();
      const error = new Error('Redis get failed');

      redisClient.get.mockRejectedValue(error);

      await expect(isTokenBlacklisted(token)).rejects.toThrow(error);
    });
  });
});
