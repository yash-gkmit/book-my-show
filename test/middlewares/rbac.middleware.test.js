const { rbacMiddleware } = require('../../src/middlewares/rbac.middleware'); // Adjust the path as necessary
const { throwCustomError } = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/helpers/common.helper', () => ({
  throwCustomError: jest.fn((message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }),
}));

describe('rbacMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {
        user_id: faker.string.uuid(),
      },
      user: {
        user_id: faker.string.uuid(),
        roles: [],
        selectedRole: null,
      },
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should allow access for Admin', async () => {
    req.user.roles = ['Admin'];

    await rbacMiddleware(['Admin', 'User'])(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(throwCustomError).not.toHaveBeenCalled();
  });

  it('should allow access for self if user has matching user_id', async () => {
    req.user.user_id = req.params.user_id; // Ensure user is accessing their own data
    req.user.roles = [];

    await rbacMiddleware(['self'])(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(throwCustomError).not.toHaveBeenCalled();
  });

  it('should allow access for a user with allowed role', async () => {
    req.user.user_id = faker.string.uuid(); // Ensure a different user
    req.user.roles = ['User'];

    await rbacMiddleware(['User'])(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(throwCustomError).not.toHaveBeenCalled();
  });

  it('should allow access for user with matching selectedRole', async () => {
    req.user.user_id = faker.string.uuid(); // Ensure a different user
    req.user.roles = [];
    req.user.selectedRole = 'Manager';

    await rbacMiddleware(['Manager'])(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(throwCustomError).not.toHaveBeenCalled();
  });

  it('should deny access if user does not have allowed role or selectedRole', async () => {
    req.user.roles = ['User'];
    req.user.selectedRole = 'Guest';

    await rbacMiddleware(['Admin', 'Manager'])(req, res, next);

    expect(throwCustomError).toHaveBeenCalledWith(
      'Forbidden: You do not have permission to access this resource',
      403,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should deny access if user has no roles and selectedRole does not match', async () => {
    req.user.roles = [];
    req.user.selectedRole = 'Guest';

    await rbacMiddleware(['Admin'])(req, res, next);

    expect(throwCustomError).toHaveBeenCalledWith(
      'Forbidden: You do not have permission to access this resource',
      403,
    );
    expect(next).not.toHaveBeenCalled();
  });
});
