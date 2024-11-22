const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  register,
  sendOtp,
  verifyOtp,
  login,
  logout,
} = require('../../src/services/auth.service'); // Adjust path if needed
const { User, Role } = require('../../src/models');
const {
  setOtpInRedis,
  getOtpFromRedis,
  deleteOtpFromRedis,
  addTokenToBlacklist,
} = require('../../src/helpers/redis.helper');
const { sendOtpEmail } = require('../../src/helpers/mail.helper');
const { faker } = require('@faker-js/faker');

// Mock external dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../src/helpers/redis.helper');
jest.mock('../../src/helpers/mail.helper');
jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');

describe('Service Functions', () => {
  describe('register', () => {
    it('should register a user successfully', async () => {
      const payload = {
        name: faker.name.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        phone: faker.phone.number(),
        roles: ['admin'],
      };

      const hashedPassword = faker.internet.password();
      bcrypt.hash.mockResolvedValue(hashedPassword);

      User.create.mockResolvedValue({
        id: faker.string.uuid(),
        setRoles: jest.fn(),
      });
      Role.findAll.mockResolvedValue([
        { id: faker.string.uuid(), name: 'admin' },
      ]);

      const result = await register(payload);

      expect(User.create).toHaveBeenCalledWith({
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        phone: payload.phone,
      });
      expect(Role.findAll).toHaveBeenCalledWith({
        where: { name: payload.roles },
      });
      expect(result).toEqual({
        userId: expect.any(String),
      });
    });

    it('should throw an error if user creation fails', async () => {
      const payload = {
        name: faker.name.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        phone: faker.phone.number(),
        roles: ['admin'],
      };

      User.create.mockResolvedValue(null);

      await expect(register(payload)).rejects.toThrow('User creation failed');
    });
  });

  describe('sendOtp', () => {
    it('should send OTP successfully', async () => {
      const email = faker.internet.email();
      const otp = faker.string.numeric(6);

      setOtpInRedis.mockResolvedValue();
      sendOtpEmail.mockResolvedValue();

      const result = await sendOtp(email);

      expect(setOtpInRedis).toHaveBeenCalledWith(email, otp);
      expect(sendOtpEmail).toHaveBeenCalledWith(email, otp);
      expect(result).toEqual({ message: 'OTP sent successfully' });
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully and return a token', async () => {
      const email = faker.internet.email();
      const otp = faker.string.numeric(6);
      const token = faker.string.uuid();

      getOtpFromRedis.mockResolvedValue(otp);
      jwt.sign.mockReturnValue(token);
      deleteOtpFromRedis.mockResolvedValue();

      const result = await verifyOtp(email, otp);

      expect(getOtpFromRedis).toHaveBeenCalledWith(email);
      expect(deleteOtpFromRedis).toHaveBeenCalledWith(email);
      expect(result).toEqual({ token: token });
    });

    it('should throw an error if OTP is invalid', async () => {
      const email = faker.internet.email();
      const otp = faker.string.numeric(6);

      getOtpFromRedis.mockResolvedValue(faker.string.numeric(6));

      await expect(verifyOtp(email, otp)).rejects.toThrow('Invalid OTP');
    });
  });

  describe('login', () => {
    it('should login successfully and return a token', async () => {
      const payload = {
        email: faker.internet.email(),
        role: 'admin',
        password: faker.internet.password(),
      };

      const user = {
        id: faker.string.uuid(),
        password: faker.internet.password(),
        Roles: [{ name: 'admin' }],
      };

      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(faker.string.uuid());

      const result = await login(payload);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: payload.email },
        include: 'Roles',
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        payload.password,
        user.password,
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: user.id, roles: ['admin'], selectedRole: payload.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' },
      );
      expect(result).toEqual({
        token: expect.any(String),
        role: ['admin'],
      });
    });

    it('should throw an error if user is not found', async () => {
      const payload = {
        email: faker.internet.email(),
        role: 'admin',
        password: faker.internet.password(),
      };

      User.findOne.mockResolvedValue(null);

      await expect(login(payload)).rejects.toThrow('User not found');
    });

    it('should throw an error if user does not have the role', async () => {
      const payload = {
        email: faker.internet.email(),
        role: 'admin',
        password: faker.internet.password(),
      };

      const user = {
        id: faker.string.uuid(),
        password: faker.internet.password(),
        Roles: [{ name: 'customer' }],
      };

      User.findOne.mockResolvedValue(user);

      await expect(login(payload)).rejects.toThrow(
        'User does not have the admin role',
      );
    });
  });

  describe('logout', () => {
    it('should log out successfully and blacklist the token', async () => {
      const token = faker.string.uuid();
      jwt.decode.mockReturnValue({ user_id: faker.string.uuid() });

      addTokenToBlacklist.mockResolvedValue();

      const result = await logout(token);

      expect(addTokenToBlacklist).toHaveBeenCalledWith(token, 300);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should throw an error for an invalid token', async () => {
      const token = faker.string.uuid();
      jwt.decode.mockReturnValue(null);

      await expect(logout(token)).rejects.toThrow('Invalid token');
    });
  });
});
