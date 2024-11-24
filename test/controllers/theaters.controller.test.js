const theaterController = require('../../src/controllers/theaters.controller');
const theaterService = require('../../src/services/theaters.service');
const { errorHandler } = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/services/theaters.service');
jest.mock('../../src/helpers/common.helper');

describe('Theater Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {
        name: faker.company.name(),
        city: faker.location.city(),
        address: faker.location.streetAddress(),
      },
    };
    res = {
      message: null,
      data: null,
      statusCode: null,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('generate', () => {
    it('should create a new theater successfully', async () => {
      const fakeTheater = {
        id: faker.string.uuid(),
        name: req.body.name,
        city: req.body.city,
        address: req.body.address,
      };
      theaterService.create.mockResolvedValue(fakeTheater);

      await theaterController.generate(req, res, next);

      expect(theaterService.create).toHaveBeenCalledWith(req.body);
      expect(res.data).toEqual(fakeTheater);
      expect(res.message).toEqual('Theaters created successfully!');
      expect(res.statusCode).toEqual(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when creating a theater', async () => {
      const errorMessage = 'Error creating theater';
      theaterService.create.mockRejectedValue(new Error(errorMessage));

      await theaterController.generate(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        expect.any(Error),
        400,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('fetchAll', () => {
    it('should return all theaters successfully', async () => {
      const fakeTheaters = [
        { id: faker.string.uuid(), name: faker.company.name() },
        { id: faker.string.uuid(), name: faker.company.name() },
      ];
      theaterService.getAll.mockResolvedValue(fakeTheaters);

      await theaterController.fetchAll(req, res, next);

      expect(theaterService.getAll).toHaveBeenCalled();
      expect(res.data).toEqual(fakeTheaters);
      expect(res.statusCode).toEqual(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when fetching all theaters', async () => {
      const errorMessage = 'Error fetching theaters';
      theaterService.getAll.mockRejectedValue(new Error(errorMessage));

      await theaterController.fetchAll(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        expect.any(Error),
        400,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('fetch', () => {
    it('should return a theater by ID successfully', async () => {
      const fakeTheater = {
        id: faker.string.uuid(),
        name: faker.company.name(),
      };
      req.params.id = fakeTheater.id;
      theaterService.get.mockResolvedValue(fakeTheater);

      await theaterController.fetch(req, res, next);

      expect(theaterService.get).toHaveBeenCalledWith(fakeTheater.id);
      expect(res.data).toEqual(fakeTheater);
      expect(res.statusCode).toEqual(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when fetching a theater by ID', async () => {
      const errorMessage = 'Theater not found';
      req.params.id = 'invalid-id';
      theaterService.get.mockRejectedValue(new Error(errorMessage));

      await theaterController.fetch(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        expect.any(Error),
        400,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('change', () => {
    it('should update a theater successfully', async () => {
      const updatedTheater = {
        id: faker.string.uuid(),
        name: 'Updated Theater',
      };
      req.params.id = updatedTheater.id;
      theaterService.update.mockResolvedValue(updatedTheater);

      await theaterController.change(req, res, next);

      expect(theaterService.update).toHaveBeenCalledWith(
        updatedTheater.id,
        req.body,
      );
      expect(res.data).toEqual(updatedTheater);
      expect(res.message).toEqual('Theater updated successfully!');
      expect(res.statusCode).toEqual(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when updating a theater', async () => {
      const errorMessage = 'Error updating theater';
      req.params.id = 'invalid-id';
      theaterService.update.mockRejectedValue(new Error(errorMessage));

      await theaterController.change(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        expect.any(Error),
        400,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a theater successfully', async () => {
      req.params.id = faker.string.uuid();
      theaterService.remove.mockResolvedValue();

      await theaterController.remove(req, res, next);

      expect(theaterService.remove).toHaveBeenCalledWith(req.params.id);
      expect(res.statusCode).toEqual(204);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when removing a theater', async () => {
      const errorMessage = 'Error removing theater';
      req.params.id = 'invalid-id';
      theaterService.remove.mockRejectedValue(new Error(errorMessage));

      await theaterController.remove(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        expect.any(Error),
        400,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('fetchMovies', () => {
    it('should return movies for a theater successfully', async () => {
      const fakeMovies = { data: [], total: 0, page: 1, limit: 10 };
      req.params.id = faker.string.uuid();
      req.query.page = 1;
      req.query.limit = 10;

      theaterService.getMovies.mockResolvedValue(fakeMovies);

      await theaterController.fetchMovies(req, res, next);

      expect(theaterService.getMovies).toHaveBeenCalledWith(
        req.params.id,
        req.query.page,
        req.query.limit,
      );
      expect(res.data).toEqual(fakeMovies);
      expect(res.statusCode).toEqual(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when fetching movies for a theater', async () => {
      const errorMessage = 'Error fetching movies';
      theaterService.getMovies.mockRejectedValue(new Error(errorMessage));

      await theaterController.fetchMovies(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        expect.any(Error),
        400,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('fetchReports', () => {
    it('should fetch reports for a theater successfully', async () => {
      const fakeReports = { totalRevenue: 10000, totalTicketsSold: 500 };
      req.query.theaterId = faker.string.uuid();

      theaterService.getReports.mockResolvedValue(fakeReports);

      await theaterController.fetchReports(req, res, next);

      expect(theaterService.getReports).toHaveBeenCalledWith(
        req.query.theaterId,
      );
      expect(res.data).toEqual(fakeReports);
      expect(res.statusCode).toEqual(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when fetching reports', async () => {
      const errorMessage = 'Error fetching reports';
      req.query.theaterId = faker.string.uuid();
      theaterService.getReports.mockRejectedValue(new Error(errorMessage));

      await theaterController.fetchReports(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        expect.any(Error),
        400,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
