const {
  register,
  sendOtp,
  verifyOtp,
  login,
  logout,
} = require('../../src/services/auth.service');
const User = require('../../src/models/User');
const Role = require('../../src/models/rRole');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addTokenToBlacklist } = require('../../src/helpers/redis.helper');
const { sendOtpEmail } = require('../../src/helpers/mail.helper');
//const { throwCustomError } = require('../helpers/common.helper');
const faker = require('faker');

// Mocking dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../src/helpers/redis.helper');
jest.mock('../../src/helpers/mail.helper');
jest.mock('../../src/helpers/common.helper');
jest.mock('../../src/models/User');
jest.mock('../../src/models/Role');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw an error if email already exists', async () => {
      const payload = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        phone: faker.phone.number(),
      };

      User.findOne.mockResolvedValueOnce({}); // Mock email exists

      await expect(register(payload)).rejects.toThrow('Email already exist!');
    });

    it('should throw an error if phone number already exists', async () => {
      const payload = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        phone: faker.phone.phoneNumber(),
      };

      User.findOne.mockResolvedValueOnce(null); // Mock email doesn't exist
      User.findOne.mockResolvedValueOnce({}); // Mock phone exists

      await expect(register(payload)).rejects.toThrow(
        'Phone number already exist!',
      );
    });

    it('should successfully create a user', async () => {
      const payload = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        phone: faker.phone.phoneNumber(),
        roles: 'Customer',
      };

      User.findOne.mockResolvedValueOnce(null); // Email not found
      User.create.mockResolvedValueOnce({ id: 1 }); // User created successfully
      Role.findAll.mockResolvedValueOnce([{ id: 1, name: 'Customer' }]); // Mock roles

      bcrypt.hash.mockResolvedValue('hashedPassword');

      await expect(register(payload)).resolves.not.toThrow();
    });
  });

  describe('sendOtp', () => {
    it('should throw an error if email does not exist', async () => {
      const email = faker.internet.email();

      User.findOne.mockResolvedValueOnce(null); // Email doesn't exist

      await expect(sendOtp(email)).rejects.toThrow('Email not exist.');
    });

    it('should send OTP successfully', async () => {
      const email = faker.internet.email();

      User.findOne.mockResolvedValueOnce({}); // Email exists
      sendOtpEmail.mockResolvedValueOnce(true); // OTP sent successfully

      await expect(sendOtp(email)).resolves.not.toThrow();
    });
  });

  describe('verifyOtp', () => {
    it('should throw an error if OTP does not exist or is expired', async () => {
      const email = faker.internet.email();
      const otp = '123456';

      User.findOne.mockResolvedValueOnce({ id: 1 }); // User exists
      otpStore.get.mockReturnValueOnce(undefined); // OTP not found

      await expect(verifyOtp(email, otp)).rejects.toThrow(
        'OTP expired or does not exist',
      );
    });

    it('should return a token if OTP is correct', async () => {
      const email = faker.internet.email();
      const otp = '123456';

      User.findOne.mockResolvedValueOnce({ id: 1 }); // User exists
      otpStore.get.mockReturnValueOnce(otp); // Correct OTP
      generateToken.mockReturnValueOnce('mockToken'); // Mock token generation

      await expect(verifyOtp(email, otp)).resolves.toEqual({
        token: 'mockToken',
      });
    });

    it('should throw an error if OTP is incorrect', async () => {
      const email = faker.internet.email();
      const otp = '123456';

      User.findOne.mockResolvedValueOnce({ id: 1 }); // User exists
      otpStore.get.mockReturnValueOnce('654321'); // Incorrect OTP

      await expect(verifyOtp(email, otp)).rejects.toThrow('Invalid OTP');
    });
  });

  describe('login', () => {
    it('should throw an error if user is not found', async () => {
      const payload = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      User.findOne.mockResolvedValueOnce(null); // User not found

      await expect(login(payload)).rejects.toThrow('user not found');
    });

    it('should throw an error if password is incorrect', async () => {
      const payload = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      User.findOne.mockResolvedValueOnce({
        email: payload.email,
        password: 'hashedPassword',
      });
      bcrypt.compare.mockResolvedValueOnce(false); // Incorrect password

      await expect(login(payload)).rejects.toThrow('Password is not correct');
    });

    it('should return a token if login is successful', async () => {
      const payload = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      User.findOne.mockResolvedValueOnce({
        email: payload.email,
        password: 'hashedPassword',
      });
      bcrypt.compare.mockResolvedValueOnce(true); // Correct password
      generateToken.mockReturnValueOnce('mockToken'); // Mock token generation

      await expect(login(payload)).resolves.toEqual({ token: 'mockToken' });
    });
  });

  describe('logout', () => {
    it('should throw an error for an invalid token', async () => {
      const token = 'invalidToken';

      jwt.decode.mockReturnValueOnce(null); // Invalid token

      await expect(logout(token)).rejects.toThrow('Invalid token');
    });

    it('should successfully log out and blacklist the token', async () => {
      const token = 'validToken';

      jwt.decode.mockReturnValueOnce({ id: 1 }); // Valid token
      addTokenToBlacklist.mockResolvedValueOnce(true); // Token blacklisted successfully

      await expect(logout(token)).resolves.not.toThrow();
    });
  });
});
