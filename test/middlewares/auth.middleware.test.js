const { authMiddleware } = require('../../src/middlewares/auth.middleware'); // Adjust the path as necessary
const {
  throwCustomError,
  errorHandler,
} = require('../../src/helpers/common.helper');
const { isTokenBlacklisted } = require('../../src/helpers/redis.helper');
const { verifyToken } = require('../../src/helpers/jwt.helper');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/helpers/common.helper', () => ({
  throwCustomError: jest.fn((message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }),
  errorHandler: jest.fn(),
}));

jest.mock('../../src/helpers/redis.helper', () => ({
  isTokenBlacklisted: jest.fn(),
}));

jest.mock('../../src/helpers/jwt.helper', () => ({
  verifyToken: jest.fn(),
}));

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: `Bearer ${faker.string.uuid()}`,
      },
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() if token is valid and not blacklisted', async () => {
    const decodedUser = {
      id: faker.string.uuid(),
      email: faker.internet.email(),
    };

    isTokenBlacklisted.mockResolvedValue(false);
    verifyToken.mockResolvedValue(decodedUser);

    await authMiddleware(req, res, next);

    expect(isTokenBlacklisted).toHaveBeenCalledWith(
      req.headers.authorization.split(' ')[1],
    );
    expect(verifyToken).toHaveBeenCalledWith(
      req.headers.authorization.split(' ')[1],
    );
    expect(req.user).toEqual(decodedUser);
    expect(next).toHaveBeenCalled();
  });

  it('should throw an error if no token is provided', async () => {
    req.headers.authorization = undefined;

    await authMiddleware(req, res, next);

    expect(throwCustomError).toHaveBeenCalledWith('Token is required', 401);
    expect(next).not.toHaveBeenCalled();
    expect(errorHandler).toHaveBeenCalledWith(
      req,
      res,
      'Token is required',
      401,
    );
  });

  it('should throw an error if token is blacklisted', async () => {
    isTokenBlacklisted.mockResolvedValue(true);

    await authMiddleware(req, res, next);

    expect(isTokenBlacklisted).toHaveBeenCalledWith(
      req.headers.authorization.split(' ')[1],
    );
    expect(throwCustomError).toHaveBeenCalledWith('Token is blacklisted', 401);
    expect(next).not.toHaveBeenCalled();
    expect(errorHandler).toHaveBeenCalledWith(
      req,
      res,
      'Token is blacklisted',
      401,
    );
  });

  it('should throw an error if token is invalid', async () => {
    isTokenBlacklisted.mockResolvedValue(false);
    verifyToken.mockRejectedValue(new Error('Invalid or expired token'));

    await authMiddleware(req, res, next);

    expect(isTokenBlacklisted).toHaveBeenCalledWith(
      req.headers.authorization.split(' ')[1],
    );
    expect(verifyToken).toHaveBeenCalledWith(
      req.headers.authorization.split(' ')[1],
    );
    expect(next).not.toHaveBeenCalled();
    expect(errorHandler).toHaveBeenCalledWith(
      req,
      res,
      'Invalid or expired token',
      undefined,
    );
  });

  it('should handle unexpected errors gracefully', async () => {
    isTokenBlacklisted.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    await authMiddleware(req, res, next);

    expect(isTokenBlacklisted).toHaveBeenCalledWith(
      req.headers.authorization.split(' ')[1],
    );
    expect(next).not.toHaveBeenCalled();
    expect(errorHandler).toHaveBeenCalledWith(
      req,
      res,
      'Unexpected error',
      undefined,
    );
  });
});
