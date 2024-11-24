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
        id: faker.string.uuid(),
        email: faker.internet.email(),
      };
      const mockToken = faker.string.uuid();

      // Mocking jwt.sign to return a mock token
      jwt.sign.mockReturnValue(mockToken);

      const token = generateToken(payload);

      // Expecting jwt.sign to be called with the correct parameters
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: payload },
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
      );
      expect(token).toBe(mockToken);
    });

    it('should throw a custom error if token generation fails', () => {
      const payload = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
      };

      // Mocking jwt.sign to throw an error
      jwt.sign.mockImplementation(() => {
        throw new Error('Token generation failed');
      });

      // Calling generateToken should trigger the custom error
      generateToken(payload);

      // Expecting throwCustomError to be called with the appropriate error message and status code
      expect(throwCustomError).toHaveBeenCalledWith(
        'Token generation failed',
        401,
      );
    });
  });

  describe('verifyToken', () => {
    it('should resolve with the decoded token if verification succeeds', async () => {
      const token = faker.string.uuid();
      const decodedPayload = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
      };

      // Mocking jwt.verify to simulate successful token verification
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, decodedPayload); // No error, returns decoded payload
      });

      const decoded = await verifyToken(token);

      // Expecting jwt.verify to be called with the correct parameters
      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        process.env.JWT_SECRET,
        expect.any(Function),
      );
      // Expecting the decoded token to be the same as the mock decoded payload
      expect(decoded).toEqual(decodedPayload);
    });

    it('should reject with an error if verification fails', async () => {
      const token = faker.string.uuid();
      const errorMessage = 'Invalid or expired token';

      // Mocking jwt.verify to simulate failed verification
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error(errorMessage), null); // Error with message
      });

      // Expecting verifyToken to reject with the error message
      await expect(verifyToken(token)).rejects.toThrow(errorMessage);

      // Expecting jwt.verify to be called with the correct parameters
      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        process.env.JWT_SECRET,
        expect.any(Function),
      );
    });

    it('should reject with an error if the token is malformed', async () => {
      const token = 'malformed-token';

      // Mocking jwt.verify to simulate a malformed token error
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Malformed token'), null); // Error with specific message
      });

      // Expecting verifyToken to reject with 'Invalid or expired token'
      await expect(verifyToken(token)).rejects.toThrow(
        'Invalid or expired token',
      );
    });
  });
});
