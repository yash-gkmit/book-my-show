const redisClient = require('../../src/config/redis');
const {
  addTokenToBlacklist,
  isTokenBlacklisted,
} = require('../../src/helpers/redis.helper');
const { faker } = require('@faker-js/faker');

// Mocking redis client methods
jest.mock('../../src/config/redis', () => ({
  set: jest.fn(),
  get: jest.fn(),
}));

describe('Token Service', () => {
  describe('addTokenToBlacklist', () => {
    it('should add a token to the blacklist', async () => {
      const token = faker.string.uuid(); // Generate a random token (UUID)
      const expiresIn = 3600; // 1 hour

      // Mocking the redis set method to resolve without any issues
      redisClient.set.mockResolvedValueOnce('OK');

      // Call the function and check if it resolves correctly
      const response = await addTokenToBlacklist(token, expiresIn);
      expect(response).toBe('Token added to blacklist');
      expect(redisClient.set).toHaveBeenCalledWith(
        token,
        'blacklisted',
        'EX',
        expiresIn,
      );
    });

    it('should throw an error when adding a token fails', async () => {
      const token = faker.string.uuid();
      const expiresIn = 3600;

      // Mocking the redis set method to throw an error
      redisClient.set.mockRejectedValueOnce(new Error('Redis error'));

      // Expect an error to be thrown
      await expect(addTokenToBlacklist(token, expiresIn)).rejects.toThrow(
        'Redis error',
      );
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true if the token is blacklisted', async () => {
      const token = faker.string.uuid();

      // Mocking the redis get method to return 'blacklisted'
      redisClient.get.mockResolvedValueOnce('blacklisted');

      // Call the function and expect the correct value
      const isBlacklisted = await isTokenBlacklisted(token);
      expect(isBlacklisted).toBe(true);
      expect(redisClient.get).toHaveBeenCalledWith(token);
    });

    it('should return false if the token is not blacklisted', async () => {
      const token = faker.string.uuid();

      // Mocking the redis get method to return null or something other than 'blacklisted'
      redisClient.get.mockResolvedValueOnce(null);

      const isBlacklisted = await isTokenBlacklisted(token);
      expect(isBlacklisted).toBe(false);
      expect(redisClient.get).toHaveBeenCalledWith(token);
    });

    it('should throw an error when checking if the token is blacklisted fails', async () => {
      const token = faker.string.uuid();

      // Mocking the redis get method to throw an error
      redisClient.get.mockRejectedValueOnce(new Error('Redis error'));

      // Expect an error to be thrown
      await expect(isTokenBlacklisted(token)).rejects.toThrow('Redis error');
    });
  });
});
