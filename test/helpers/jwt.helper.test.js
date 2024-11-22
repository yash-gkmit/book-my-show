const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../../src/helpers/jwt.helper');
const { throwCustomError } = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');

jest.mock('jsonwebtoken');
jest.mock('../../src/helpers/common.helper');

describe('Auth Utils', () => {
  describe('generateToken', () => {
    it('should generate a token with the provided payload', () => {
      const payload = {
        id: faker.string.uuid,
        email: faker.internet.email(),
      };
      const mockToken = faker.string.uuid;

      jwt.sign.mockReturnValue(mockToken);

      const token = generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      expect(token).toBe(mockToken);
    });

    it('should throw a custom error if token generation fails', () => {
      const payload = {
        id: faker.string.uuid,
        email: faker.internet.email(),
      };

      jwt.sign.mockImplementation(() => {
        throw new Error('Token generation failed');
      });

      generateToken(payload);

      expect(throwCustomError).toHaveBeenCalledWith(
        'Token generation failed',
        401,
      );
    });
  });

  describe('verifyToken', () => {
    it('should resolve with the decoded token if verification succeeds', async () => {
      const token = faker.string.uuid;
      const decodedPayload = {
        id: faker.string.uuid,
        email: faker.internet.email(),
      };

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, decodedPayload);
      });

      const decoded = await verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        process.env.JWT_SECRET,
        expect.any(Function),
      );
      expect(decoded).toEqual(decodedPayload);
    });

    it('should reject with an error if verification fails', async () => {
      const token = faker.string.uuid;
      const errorMessage = 'Invalid or expired token';

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error(errorMessage), null);
      });

      await expect(verifyToken(token)).rejects.toThrow(errorMessage);

      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        process.env.JWT_SECRET,
        expect.any(Function),
      );
    });

    it('should reject with an error if the token is malformed', async () => {
      const token = 'malformed-token';

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Malformed token'), null);
      });

      await expect(verifyToken(token)).rejects.toThrow(
        'Invalid or expired token',
      );
    });
  });
});
