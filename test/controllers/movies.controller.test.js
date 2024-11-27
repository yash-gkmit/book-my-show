const movieController = require('../../src/controllers/movies.controller');
const movieService = require('../../src/services/movies.service');
const { uploadOnS3 } = require('../../src/helpers/s3.helper');
const { errorHandler } = require('../../src/helpers/common.helper');
const path = require('path');
const fs = require('fs');
const { faker } = require('@faker-js/faker');

// Mock dependencies
jest.mock('aws-sdk', () => {
  return {
    S3: jest.fn(() => ({
      upload: jest.fn(() => ({
        promise: jest
          .fn()
          .mockResolvedValue({ Location: 'https://mock-s3-url.com/file.jpg' }),
      })),
    })),
    config: {
      update: jest.fn(),
    },
  };
});

jest.mock('../../src/services/movies.service');
jest.mock('../../src/helpers/s3.helper');
jest.mock('../../src/helpers/common.helper');
jest.mock('fs', () => ({
  ...jest.requireActual('fs'), // Retain other fs functions
  existsSync: jest.fn().mockReturnValue(true), // Mock fs.existsSync to return true
  readdirSync: jest.fn().mockReturnValue([]), // Mock readdirSync to return an empty array
}));
jest.mock('path');
jest.mock('../../src/models');

describe('Movies Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      files: {
        poster: [{ originalname: 'poster.jpg' }],
        trailer: [{ originalname: 'trailer.mp4' }],
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      download: jest.fn(),
      data: null,
      statusCode: null,
      message: null,
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should upload files to S3 and create a movie', async () => {
      const posterUrl = 'https://mock-s3-url.com/poster.jpg';
      const trailerUrl = 'https://mock-s3-url.com/trailer.mp4';
      const movieData = { id: faker.string.uuid(), title: 'Sample Movie' };

      uploadOnS3
        .mockResolvedValueOnce(posterUrl)
        .mockResolvedValueOnce(trailerUrl);
      movieService.create.mockResolvedValue(movieData);

      req.body = { title: 'Sample Movie', theaterIds: [faker.string.uuid()] };

      await movieController.create(req, res, next);

      expect(uploadOnS3).toHaveBeenCalledWith(req.files.poster[0], 'poster');
      expect(uploadOnS3).toHaveBeenCalledWith(req.files.trailer[0], 'trailer');
      expect(movieService.create).toHaveBeenCalledWith(req.body.theaterIds, {
        ...req.body,
        poster: posterUrl,
        trailer: trailerUrl,
      });
      expect(res.message).toBe('Movie created successfully!');
      expect(res.statusCode).toEqual(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during movie creation', async () => {
      const errorMessage = 'Error creating movie';
      uploadOnS3.mockRejectedValue(new Error(errorMessage));

      await movieController.create(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        expect.any(Error),
        400,
      );
    });
  });

  describe('getAll', () => {
    it('should fetch all movies', async () => {
      const movies = {
        data: [{ id: faker.string.uuid(), title: 'Sample Movie' }],
      };

      movieService.getAll.mockResolvedValue(movies);

      req.query = { page: 1, limit: 10 };

      await movieController.getAll(req, res, next);

      expect(movieService.getAll).toHaveBeenCalledWith(req.query);
      expect(res.message).toBe('Movies fetched successfully');
      expect(res.statusCode).toEqual(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle no movies found', async () => {
      movieService.getAll.mockResolvedValue({ data: [] });

      await movieController.getAll(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        'No movies found',
        404,
      );
    });

    it('should handle errors during fetching movies', async () => {
      const errorMessage = 'Error fetching movies';
      movieService.getAll.mockRejectedValue(new Error(errorMessage));

      await movieController.getAll(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        expect.any(Error),
        400,
      );
    });
  });

  describe('get', () => {
    it('should fetch a movie by ID', async () => {
      const movie = { id: faker.string.uuid(), title: 'Sample Movie' };
      movieService.get.mockResolvedValue(movie);

      req.params = { id: faker.string.uuid() };

      await movieController.get(req, res, next);

      expect(movieService.get).toHaveBeenCalledWith(req.params);
      expect(res.message).toBe('Movie fetched successfully!');
      expect(res.data).toEqual(movie);
      expect(res.statusCode).toEqual(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle movie not found', async () => {
      movieService.get.mockResolvedValue(null);

      await movieController.get(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        'Movie not found',
        404,
      );
    });
  });

  describe('update', () => {
    it('should update a movie', async () => {
      const updatedMovie = { id: faker.string.uuid(), title: 'Updated Movie' };
      movieService.update.mockResolvedValue(updatedMovie);

      req.params = { id: faker.string.uuid() };
      req.body = { title: 'Updated Movie' };

      await movieController.update(req, res, next);

      expect(movieService.update).toHaveBeenCalledWith({
        id: req.params,
        body: req.body,
      });
      expect(res.message).toBe('Movie updated successfully');
      expect(res.data).toEqual(updatedMovie);
      expect(res.statusCode).toEqual(200);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a movie', async () => {
      req.params = { id: faker.string.uuid() };

      movieService.remove.mockResolvedValue();

      await movieController.remove(req, res, next);

      expect(movieService.remove).toHaveBeenCalledWith(req.params);
      expect(res.message).toBe('Movie deleted successfully');
      expect(res.statusCode).toEqual(200);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getTheatersByMovieId', () => {
    it('should fetch theaters by movie ID', async () => {
      const theaters = [{ id: faker.string.uuid(), name: 'Theater 1' }];

      movieService.getTheatersByMovieId.mockResolvedValue(theaters);

      req.params = { id: faker.string.uuid() };

      await movieController.getTheatersByMovieId(req, res, next);

      expect(movieService.getTheatersByMovieId).toHaveBeenCalledWith(
        req.params,
      );
      expect(res.message).toBe('Movie fetched by theater successfully!');
      expect(res.data).toEqual(theaters);
      expect(res.statusCode).toEqual(200);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getReport', () => {
    it('should download a report file', async () => {
      const filePath = '/mock-path/report.pdf';
      movieService.getReport.mockResolvedValue(filePath);

      req.query = { startDate: '2023-01-01', endDate: '2023-12-31' };

      await movieController.getReport(req, res);

      expect(movieService.getReport).toHaveBeenCalledWith(req.query);
      expect(fs.existsSync).toHaveBeenCalledWith(filePath);
      expect(res.download).toHaveBeenCalledWith(
        filePath,
        path.basename(filePath),
        expect.any(Function),
      );
    });
  });
});
