const authController = require('../../src/controllers/auth.controller');
const authService = require('../../src/services/auth.service');
const {
  errorHandler,
  responseHandler,
} = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');
const { validateRequest } = require('../../src/helpers/validate.helper');

jest.mock('../../src/services/auth.service');
jest.mock('../../src/helpers/validate.helper');
jest.mock('../../src/helpers/common.helper', () => ({
  errorHandler: jest.fn(),
  responseHandler: jest.fn(),
  throwCustomError: jest.fn((message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }),
}));

describe('Auth Controller Tests', () => {
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    message: null,
    data: null,
    statusCode: null,
  };

  const mockRequest = (body = {}, params = {}, query = {}, headers = {}) => ({
    body,
    params,
    query,
    headers,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a user successfully', async () => {
      const payload = {
        email: faker.internet.email(),
        password: 'password123',
      };
      const result = { id: faker.string.uuid(), ...payload };

      authService.register.mockResolvedValue(result);

      const req = mockRequest(payload);
      await authController.register(req, mockResponse);

      expect(authService.register).toHaveBeenCalledWith(payload);
      expect(mockResponse.statusCode).toBe(201);
      expect(mockResponse.message).toBe('user created successfully!');
      expect(mockResponse.data).toEqual(result);
      expect(responseHandler).toHaveBeenCalledWith(req, mockResponse);
    });

    it('should handle registration errors', async () => {
      const payload = {
        email: faker.internet.email(),
        password: 'password123',
      };
      const errorMessage = 'User already exists';

      authService.register.mockRejectedValue(new Error(errorMessage));

      const req = mockRequest(payload);
      await authController.register(req, mockResponse);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        mockResponse,
        expect.any(Error),
        400,
      );
    });
  });

  describe('POST /send-otp', () => {
    it('should send OTP successfully', async () => {
      const email = faker.internet.email();
      authService.sendOtp.mockResolvedValue();

      const req = mockRequest({ email });
      await authController.sendOtp(req, mockResponse);

      expect(authService.sendOtp).toHaveBeenCalledWith(email);
      expect(mockResponse.statusCode).toBe(200);
      expect(mockResponse.message).toBe(`otp send successfully to ${email}`);
      expect(responseHandler).toHaveBeenCalledWith(req, mockResponse);
    });

    it('should handle errors when sending OTP', async () => {
      const email = faker.internet.email();
      const errorMessage = 'Unable to send OTP';

      authService.sendOtp.mockRejectedValue(new Error(errorMessage));

      const req = mockRequest({ email });
      await authController.sendOtp(req, mockResponse);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        mockResponse,
        expect.any(Error),
        400,
      );
    });
  });

  describe('POST /verify-otp', () => {
    it('should verify OTP successfully', async () => {
      const email = faker.internet.email();
      const otp = '123456';
      const result = { verified: true };

      authService.verifyOtp.mockResolvedValue(result);

      const req = mockRequest({ email, otp });
      await authController.verifyOtp(req, mockResponse);

      expect(authService.verifyOtp).toHaveBeenCalledWith(email, otp);
      expect(mockResponse.statusCode).toBe(200);
      expect(mockResponse.message).toBe('OTP verified successfully!');
      expect(mockResponse.data).toEqual(result);
      expect(responseHandler).toHaveBeenCalledWith(req, mockResponse);
    });

    it('should handle OTP verification errors', async () => {
      const email = faker.internet.email();
      const otp = '123456';
      const errorMessage = 'Invalid OTP';

      authService.verifyOtp.mockRejectedValue(new Error(errorMessage));

      const req = mockRequest({ email, otp });
      await authController.verifyOtp(req, mockResponse);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        mockResponse,
        expect.any(Error),
        400,
      );
    });
  });

  describe('POST /login', () => {
    it('should login successfully', async () => {
      const payload = {
        email: faker.internet.email(),
        password: 'password123',
      };
      const result = { token: 'dummy-jwt-token', roles: ['user'] };

      authService.login.mockResolvedValue(result);

      const req = mockRequest(payload);
      await authController.login(req, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(payload);
      expect(mockResponse.statusCode).toBe(200);
      expect(mockResponse.message).toBe('Login successful');
      expect(mockResponse.data).toEqual(result);
      expect(responseHandler).toHaveBeenCalledWith(req, mockResponse);
    });

    it('should handle login errors', async () => {
      const payload = {
        email: faker.internet.email(),
        password: 'wrongpassword',
      };
      const errorMessage = 'Invalid credentials';

      authService.login.mockRejectedValue(new Error(errorMessage));

      const req = mockRequest(payload);
      await authController.login(req, mockResponse);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        mockResponse,
        expect.any(Error),
        401,
      );
    });
  });

  describe('POST /logout', () => {
    it('should logout successfully', async () => {
      const token = 'dummy-jwt-token';
      authService.logout.mockResolvedValue();

      const req = mockRequest({}, {}, {}, { authorization: `Bearer ${token}` });
      await authController.logout(req, mockResponse);

      expect(authService.logout).toHaveBeenCalledWith(token);
      expect(mockResponse.statusCode).toBe(200);
      expect(mockResponse.message).toBe('Successfully logged out');
      expect(responseHandler).toHaveBeenCalledWith(req, mockResponse);
    });

    it('should handle missing token for logout', async () => {
      const req = mockRequest({}, {}, {}, {});

      await authController.logout(req, mockResponse);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        mockResponse,
        'Token is required for logout',
        401,
      );
    });
  });
});
