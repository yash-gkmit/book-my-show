const {
  throwCustomError,
  errorHandler,
  responseHandler,
} = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');

describe('Utils Module', () => {
  describe('throwCustomError', () => {
    it('should throw an error with the provided message and status code', () => {
      const message = faker.lorem.sentence();
      const statusCode = faker.number.int({ min: 400, max: 500 });

      expect(() => throwCustomError(message, statusCode)).toThrowError(message);

      try {
        throwCustomError(message, statusCode);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe(message);
        expect(err.statusCode).toBe(statusCode);
      }
    });

    it('should default status code to 400 when not provided', () => {
      const message = faker.lorem.sentence();

      try {
        throwCustomError(message);
      } catch (err) {
        expect(err.statusCode).toBe(400);
      }
    });
  });

  describe('errorHandler', () => {
    it('should send a JSON response with the provided message and status code', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const message = faker.lorem.sentence();
      const statusCode = faker.number.int({ min: 400, max: 500 });

      errorHandler(req, res, message, statusCode);

      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.json).toHaveBeenCalledWith({ message });
    });

    it('should default to message "Something went wrong" and status code 400', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      errorHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
      });
    });
  });

  describe('responseHandler', () => {
    it('should send a JSON response with the provided message and data', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        message: faker.lorem.words(2),
        data: { key: faker.lorem.word() },
        statusCode: faker.number.int({ min: 200, max: 299 }),
      };

      responseHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(res.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        message: res.message,
        data: res.data,
      });
    });

    it('should default to message "success" when message is not provided', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        data: { key: faker.lorem.word() },
        statusCode: faker.number.int({ min: 200, max: 299 }),
      };

      delete res.message; // Ensure no message is provided

      responseHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(res.statusCode);
      expect(res.json).toHaveBeenCalledWith({
        message: 'success',
        data: res.data,
      });
    });
  });
});
