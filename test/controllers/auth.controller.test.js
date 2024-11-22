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

  describe('POST /send-otp', () => {
    it('should send OTP successfully', async () => {
      const email = faker.internet.email();
      authService.sendOtp.mockResolvedValue(true);

      const req = mockRequest({ email });
      await authController.sendOtp(req, mockResponse);

      expect(validateRequest).toHaveBeenCalledWith(
        { email },
        { email: 'email' },
      );
      expect(authService.sendOtp).toHaveBeenCalledWith(email);
      expect(mockResponse.statusCode).toBe(200);
      expect(responseHandler).toHaveBeenCalledWith(req, mockResponse);
    });
  });

  describe('POST /verify-otp', () => {
    it('should verify OTP successfully', async () => {
      const email = faker.internet.email();
      const otp = '123456';
      authService.verifyOtp.mockResolvedValue(true);

      const req = mockRequest({ email, otp });
      await authController.verifyOtp(req, mockResponse);

      expect(validateRequest).toHaveBeenCalledWith(
        { email, otp },
        { email: 'email', otp: 'otp' },
      );
      expect(authService.verifyOtp).toHaveBeenCalledWith(email, otp);
      expect(responseHandler).toHaveBeenCalledWith(req, mockResponse);
      expect(mockResponse.statusCode).toBe(200);
    });

    it('should return an error for invalid OTP', async () => {
      const email = faker.internet.email();
      const invalidOtp = 'abcd123';
      authService.verifyOtp.mockRejectedValue(new Error('Invalid OTP'));

      const req = mockRequest({ email, otp: invalidOtp });

      await authController.verifyOtp(req, mockResponse);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        mockResponse,
        'Invalid OTP',
        400,
      );
    });
  });

  describe('POST /login', () => {
    it('should login successfully', async () => {
      const email = faker.internet.email();
      const password = 'password123';
      const roles = ['user'];
      const token = 'dummy-jwt-token';

      authService.login.mockResolvedValue({ token, roles });

      const req = mockRequest({ email, password });
      await authController.login(req, mockResponse);

      expect(authService.login).toHaveBeenCalledWith({ email, password });
      expect(mockResponse.statusCode).toBe(200);
      expect(responseHandler).toHaveBeenCalledWith(req, mockResponse);
    });

    it('should return error for invalid credentials', async () => {
      const email = faker.internet.email();
      const password = 'wrongpassword';
      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      const req = mockRequest({ email, password });
      await authController.login(req, mockResponse);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        mockResponse,
        'Invalid credentials',
        401,
      );
    });
  });

  describe('POST /logout', () => {
    it('should logout successfully', async () => {
      const token = 'dummy-jwt-token';
      authService.logout.mockResolvedValue({
        message: 'Successfully logged out',
      });

      const req = mockRequest({}, {}, {}, { authorization: `Bearer ${token}` });
      await authController.logout(req, mockResponse);

      expect(authService.logout).toHaveBeenCalledWith(token);
      expect(mockResponse.statusCode).toBe(200);
      expect(responseHandler).toHaveBeenCalledWith(req, mockResponse);
    });

    it('should return an error for missing token', async () => {
      const req = mockRequest({}, {}, {}); // No headers, simulating a missing token

      await authController.logout(req, mockResponse);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        mockResponse,
        'Token is required for logout',
        401, // Match the status code returned by the controller
      );
    });
  });
});
