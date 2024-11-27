const cityService = require('../../src/services/cities.service');
const {
  errorHandler,
  throwCustomError,
} = require('../../src/helpers/common.helper');
const citiesController = require('../../src/controllers/cities.controller');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/services/cities.service');
jest.mock('../../src/helpers/common.helper');

describe('Cities Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { params: {}, body: {}, query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      message: null,
      data: null,
      statusCode: null,
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a city and set appropriate response values', async () => {
      const city = { id: faker.string.uuid(), name: faker.location.city() };
      cityService.create.mockResolvedValue(city);

      mockReq.body = { name: city.name };

      await citiesController.create(mockReq, mockRes, mockNext);

      expect(cityService.create).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.message).toBe('City created successfully');
      expect(mockRes.data).toEqual(city);
      expect(mockRes.statusCode).toBe(201);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors during city creation', async () => {
      const errorMessage = 'City creation failed';
      cityService.create.mockRejectedValue(new Error(errorMessage));

      await citiesController.create(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        new Error(errorMessage),
        400,
      );
    });
  });

  describe('getAll', () => {
    it('should fetch all cities and set appropriate response values', async () => {
      const cities = {
        data: Array.from({ length: 3 }, () => ({
          id: faker.string.uuid(),
          name: faker.location.city(),
        })),
        total: 3,
      };
      cityService.getAll.mockResolvedValue(cities);

      mockReq.query = { page: 1, limit: 10 };

      await citiesController.getAll(mockReq, mockRes, mockNext);

      expect(cityService.getAll).toHaveBeenCalledWith(mockReq.query);
      expect(mockRes.message).toBe('Fetching all cities details');
      expect(mockRes.data).toEqual(cities);
      expect(mockRes.statusCode).toBe(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle no cities found and throw an error', async () => {
      cityService.getAll.mockResolvedValue({ data: [] });

      await citiesController.getAll(mockReq, mockRes, mockNext);

      expect(cityService.getAll).toHaveBeenCalledWith(mockReq.query);
      expect(throwCustomError).toHaveBeenCalledWith('No cities found', 404);
    });
  });

  describe('get', () => {
    it('should fetch a city by ID and set appropriate response values', async () => {
      const city = { id: faker.string.uuid(), name: faker.location.city() };
      cityService.get.mockResolvedValue(city);

      mockReq.params = { id: city.id };

      await citiesController.get(mockReq, mockRes, mockNext);

      expect(cityService.get).toHaveBeenCalledWith(mockReq.params);
      expect(mockRes.message).toBe('Fetching specific city details');
      expect(mockRes.data).toEqual(city);
      expect(mockRes.statusCode).toBe(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching city by ID', async () => {
      const errorMessage = 'City not found';
      cityService.get.mockRejectedValue(new Error(errorMessage));

      mockReq.params = { id: faker.string.uuid() };

      await citiesController.get(mockReq, mockRes, mockNext);

      expect(cityService.get).toHaveBeenCalledWith(mockReq.params);
      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        new Error(errorMessage),
        404,
      );
    });
  });

  describe('update', () => {
    it('should update a city and set appropriate response values', async () => {
      const city = { id: faker.string.uuid(), name: 'Updated City' };
      cityService.update.mockResolvedValue(city);

      mockReq.params = { id: city.id };
      mockReq.body = { name: 'Updated City' };

      await citiesController.update(mockReq, mockRes, mockNext);

      expect(cityService.update).toHaveBeenCalledWith({
        id: mockReq.params,
        data: mockReq.body,
      });
      expect(mockRes.message).toBe('City updated successfully');
      expect(mockRes.data).toEqual(city);
      expect(mockRes.statusCode).toBe(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when updating a city', async () => {
      const errorMessage = 'Update failed';
      cityService.update.mockRejectedValue(new Error(errorMessage));

      mockReq.params = { id: faker.string.uuid() };
      mockReq.body = { name: 'Updated City' };

      await citiesController.update(mockReq, mockRes, mockNext);

      expect(cityService.update).toHaveBeenCalledWith({
        id: mockReq.params,
        data: mockReq.body,
      });
      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        new Error(errorMessage),
        400,
      );
    });
  });

  describe('remove', () => {
    it('should delete a city and set statusCode to 200', async () => {
      mockReq.params = { id: faker.string.uuid() };

      await citiesController.remove(mockReq, mockRes, mockNext);

      expect(cityService.remove).toHaveBeenCalledWith(mockReq.params.id);
      expect(mockRes.statusCode).toBe(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when deleting a city', async () => {
      const errorMessage = 'Delete failed';
      cityService.remove.mockRejectedValue(new Error(errorMessage));

      mockReq.params = { id: faker.string.uuid() };

      await citiesController.remove(mockReq, mockRes, mockNext);

      expect(cityService.remove).toHaveBeenCalledWith(mockReq.params.id);
      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        new Error(errorMessage),
        400,
      );
    });
  });

  describe('getTheaters', () => {
    it('should fetch theaters for a city and set appropriate response values', async () => {
      const theaters = {
        data: Array.from({ length: 3 }, () => ({
          id: faker.string.uuid(),
          name: faker.company.name(),
        })),
        total: 3,
      };
      cityService.getTheaters.mockResolvedValue(theaters);

      mockReq.params = { id: faker.string.uuid() };
      mockReq.query = { page: 1, limit: 10 };

      await citiesController.getTheaters(mockReq, mockRes, mockNext);

      expect(cityService.getTheaters).toHaveBeenCalledWith(
        mockReq.params.id,
        1,
        10,
      );
      expect(mockRes.message).toBe('Theater by city fetched successfully');
      expect(mockRes.data).toEqual(theaters);
      expect(mockRes.statusCode).toBe(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle no theaters found for a city', async () => {
      cityService.getTheaters.mockResolvedValue({ data: [] });

      mockReq.params = { id: faker.string.uuid() };

      await citiesController.getTheaters(mockReq, mockRes, mockNext);

      expect(cityService.getTheaters).toHaveBeenCalledWith(
        mockReq.params.id,
        1,
        10,
      );
      expect(throwCustomError).toHaveBeenCalledWith(
        'No theaters found for the specified city.',
        404,
      );
    });
  });

  describe('getReport', () => {
    it('should generate a city-based report and set appropriate response values', async () => {
      const filePath = '/path/to/report.pdf';
      cityService.getReport.mockResolvedValueOnce(filePath);

      mockReq.query = {
        city: 'Test City',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      await citiesController.getReport(mockReq, mockRes, mockNext);

      expect(cityService.getReport).toHaveBeenCalledWith(
        'Test City',
        '2024-01-01',
        '2024-01-31',
      );
      expect(mockRes.data).toEqual({
        filePath,
      });
      expect(mockRes.message).toBe('Report generated successfully');
      expect(mockRes.statusCode).toBe(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when generating a report', async () => {
      const errorMessage = 'Report generation failed';
      // cityService.getReport.mockRejectedValue(new Error(errorMessage));

      mockReq.query = {
        city: 'Test City',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      await citiesController.getReport(mockReq, mockRes, mockNext);

      expect(cityService.getReport).toHaveBeenCalledWith(
        'Test City',
        '2024-01-01',
        '2024-01-31',
      );
      expect(mockRes.status).toHaveBeenCalledWith(400);
      // expect(mockRes.json).toHaveBeenCalledWith({
      //   message: 'received value must be a mock or spy function.',
      //   error: errorMessage,
      // });

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
