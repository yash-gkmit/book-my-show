const showController = require('../../src/controllers/shows.controller');
const showService = require('../../src/services/shows.service');
const {
  responseHandler,
  errorHandler,
} = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');

// Mock dependencies
jest.mock('../../src/services/shows.service');
jest.mock('../../src/helpers/common.helper');

describe('Shows Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      data: null,
      statusCode: null,
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('generate', () => {
    it('should create a new show successfully', async () => {
      const newShow = { id: faker.string.uuid(), name: 'Show 1' };
      showService.create.mockResolvedValue(newShow);

      req.body = {
        name: 'Show 1',
        date: '2024-11-20',
        theaterId: faker.string.uuid(),
      };

      await showController.generate(req, res, next);

      expect(showService.create).toHaveBeenCalledWith(req.body);
      expect(res.data).toEqual(newShow);
      expect(res.statusCode).toBe(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during show creation', async () => {
      const errorMessage = 'Error creating show';
      showService.create.mockRejectedValue(new Error(errorMessage));

      await showController.generate(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('fetchAll', () => {
    it('should fetch all shows successfully', async () => {
      const shows = [
        { id: faker.string.uuid(), name: 'Show 1' },
        { id: faker.string.uuid(), name: 'Show 2' },
      ];
      const paginationInfo = { page: 1, limit: 10, totalRecords: 2 };

      showService.getAll.mockResolvedValue({ data: shows, ...paginationInfo });

      req.query = { page: 1, limit: 10 };

      await showController.fetchAll(req, res, next);

      expect(showService.getAll).toHaveBeenCalledWith({}, 1, 10);
      expect(res.data.message).toBe('Fetched shows successfully');
      expect(res.data.shows.data).toEqual(shows);
      expect(res.data.shows.page).toBe(1);
      expect(res.data.shows.totalRecords).toBe(2);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during fetching shows', async () => {
      const errorMessage = 'Error fetching shows';
      showService.getAll.mockRejectedValue(new Error(errorMessage));

      await showController.fetchAll(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        'An error occurred while fetching shows',
        400,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('fetch', () => {
    it('should fetch a show by ID successfully', async () => {
      const show = { id: faker.string.uuid(), name: 'Show 1' };
      showService.get.mockResolvedValue(show);

      req.params.id = show.id;

      await showController.fetch(req, res, next);

      expect(showService.get).toHaveBeenCalledWith(req.params.id);
      expect(res.data.message).toBe('Fetched show By Id successfully');
      expect(res.data.show).toEqual(show);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during fetching show by ID', async () => {
      const errorMessage = 'Show not found';
      showService.get.mockRejectedValue(new Error(errorMessage));

      req.params.id = faker.string.uuid();

      await showController.fetch(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('change', () => {
    it('should update a show successfully', async () => {
      const updatedShow = { id: faker.string.uuid(), name: 'Updated Show' };
      showService.update.mockResolvedValue(updatedShow);

      req.params.id = updatedShow.id;
      req.body = { name: 'Updated Show' };

      await showController.change(req, res, next);

      expect(showService.update).toHaveBeenCalledWith(req.params.id, req.body);
      expect(res.data).toEqual(updatedShow);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during show update', async () => {
      const errorMessage = 'Error updating show';
      showService.update.mockRejectedValue(new Error(errorMessage));

      await showController.change(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a show successfully', async () => {
      req.params.id = faker.string.uuid();

      showService.remove.mockResolvedValue();

      await showController.remove(req, res, next);

      expect(showService.remove).toHaveBeenCalledWith(req.params.id);
      expect(res.statusCode).toBe(204);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during show deletion', async () => {
      const errorMessage = 'Error deleting show';
      showService.remove.mockRejectedValue(new Error(errorMessage));

      await showController.remove(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
