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
    mockRes = {};
    mockNext = jest.fn();

    mockRes.statusCode = null;
    mockRes.message = null;
    mockRes.data = null;

    jest.clearAllMocks();
  });

  describe('generate', () => {
    it('should create a city and set appropriate response values', async () => {
      const city = { id: faker.string.uuid(), name: faker.location.city() };
      cityService.create.mockResolvedValue(city);

      mockReq.body = { name: city.name };

      await citiesController.generate(mockReq, mockRes, mockNext);

      expect(cityService.create).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.message).toBe('City created successfully');
      expect(mockRes.data).toEqual(city);
      expect(mockRes.statusCode).toBe(201);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors during city creation', async () => {
      const errorMessage = 'City creation failed';
      cityService.create.mockRejectedValue(new Error(errorMessage));

      await citiesController.generate(mockReq, mockRes, mockNext);

      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        errorMessage,
        400,
      );
    });
  });

  describe('fetchAll', () => {
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

      await citiesController.fetchAll(mockReq, mockRes, mockNext);

      expect(cityService.getAll).toHaveBeenCalledWith(1, 10);
      expect(mockRes.message).toBe('Fetching all cities details');
      expect(mockRes.data).toEqual(cities);
      expect(mockRes.statusCode).toBe(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle no cities found and throw error', async () => {
      cityService.getAll.mockResolvedValue({ data: [] });

      await citiesController.fetchAll(mockReq, mockRes, mockNext);

      expect(cityService.getAll).toHaveBeenCalled();
      expect(throwCustomError).toHaveBeenCalledWith('No cities found', 404);
    });
  });

  describe('fetch', () => {
    it('should fetch a city by ID and set appropriate response values', async () => {
      const city = { id: faker.string.uuid(), name: faker.location.city() };
      cityService.get.mockResolvedValue(city);

      mockReq.params.id = city.id;

      await citiesController.fetch(mockReq, mockRes, mockNext);

      expect(cityService.get).toHaveBeenCalledWith(city.id);
      expect(mockRes.message).toBe('Fetching specific city details');
      expect(mockRes.data).toEqual(city);
      expect(mockRes.statusCode).toBe(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching city by ID', async () => {
      const errorMessage = 'City not found';
      cityService.get.mockRejectedValue(new Error(errorMessage));

      mockReq.params.id = faker.string.uuid();

      await citiesController.fetch(mockReq, mockRes, mockNext);

      expect(cityService.get).toHaveBeenCalled();
      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        errorMessage,
        404,
      );
    });
  });

  describe('change', () => {
    it('should update a city and set appropriate response values', async () => {
      const city = { id: faker.string.uuid(), name: 'Updated City' };
      cityService.update.mockResolvedValue(city);

      mockReq.params.id = city.id;
      mockReq.body = { name: 'Updated City' };

      await citiesController.change(mockReq, mockRes, mockNext);

      expect(cityService.update).toHaveBeenCalledWith(city.id, mockReq.body);
      expect(mockRes.message).toBe('City updated successfully');
      expect(mockRes.data).toEqual(city);
      expect(mockRes.statusCode).toBe(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when updating a city', async () => {
      const errorMessage = 'Update failed';
      cityService.update.mockRejectedValue(new Error(errorMessage));

      mockReq.params.id = faker.string.uuid();
      mockReq.body = { name: 'Updated City' };

      await citiesController.change(mockReq, mockRes, mockNext);

      expect(cityService.update).toHaveBeenCalled();
      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        errorMessage,
        400,
      );
    });
  });

  describe('remove', () => {
    it('should delete a city and set statusCode to 200', async () => {
      mockReq.params.id = faker.string.uuid();

      await citiesController.remove(mockReq, mockRes, mockNext);

      expect(cityService.remove).toHaveBeenCalledWith(mockReq.params.id);
      expect(mockRes.statusCode).toBe(200);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when deleting a city', async () => {
      const errorMessage = 'Delete failed';
      cityService.remove.mockRejectedValue(new Error(errorMessage));

      mockReq.params.id = faker.string.uuid();

      await citiesController.remove(mockReq, mockRes, mockNext);

      expect(cityService.remove).toHaveBeenCalled();
      expect(errorHandler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        errorMessage,
        400,
      );
    });
  });

  describe('fetchReport', () => {
    it('should generate a city-based report and set appropriate response values', async () => {
      const filePath = '/path/to/report.pdf';
      cityService.generateReport.mockResolvedValue(filePath);

      mockReq.query = {
        city: 'Test City',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      await citiesController.fetchReport(mockReq, mockRes, mockNext);

      expect(cityService.generateReport).toHaveBeenCalledWith(
        'Test City',
        '2024-01-01',
        '2024-01-31',
      );
      expect(mockRes.data).toEqual({
        message: 'Report generated successfully.',
        filePath: filePath,
      });
      expect(mockRes.statusCode).toBe(200);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
