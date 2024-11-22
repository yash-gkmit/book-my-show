const movieController = require('../../src/controllers/movies.controller');
const movieService = require('../../src/services/movies.service');
const { uploadOnS3 } = require('../../src/helpers/s3.helper');
const { errorHandler } = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');

// Mock dependencies
jest.mock('../../src/services/movies.service');
jest.mock('../../src/helpers/s3.helper');
jest.mock('../../src/helpers/common.helper');
jest.mock('fs', () => ({
  ...jest.requireActual('fs'), // Retain other fs functions
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

  describe('generate', () => {
    it('should upload files to S3 and create a movie', async () => {
      const posterUrl = faker.internet.url();
      const trailerUrl = faker.internet.url();
      const movieData = {
        id: faker.string.uuid(),
        title: 'Sample Movie',
        theaters: [],
      };

      uploadOnS3
        .mockResolvedValueOnce(posterUrl)
        .mockResolvedValueOnce(trailerUrl);
      movieService.create.mockResolvedValue({
        toJSON: jest.fn().mockReturnValue(movieData),
        theaters: [],
      });

      req.body = {
        title: 'Sample Movie',
        theaterIds: [faker.string.uuid()],
      };

      await movieController.generate(req, res, next);

      expect(uploadOnS3).toHaveBeenCalledWith(req.files.poster[0], 'poster');
      expect(uploadOnS3).toHaveBeenCalledWith(req.files.trailer[0], 'trailer');
      expect(movieService.create).toHaveBeenCalledWith(
        { ...req.body, poster: posterUrl, trailer: trailerUrl },
        req.body.theaterIds,
      );
      expect(res.data.message).toBe('Movie created successfully!');
      expect(res.statusCode).toEqual(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during movie creation', async () => {
      const errorMessage = 'Error creating movie';
      uploadOnS3.mockRejectedValue(new Error(errorMessage));

      await movieController.generate(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('fetchAll', () => {
    it('should fetch all movies with pagination', async () => {
      const movies = {
        currentPage: 1,
        totalPages: 5,
        totalRecords: 50,
        data: [{ id: faker.string.uuid(), title: 'Sample Movie' }],
      };

      movieService.getAll.mockResolvedValue(movies);

      req.query = { page: 1, limit: 10 };

      await movieController.fetchAll(req, res, next);

      expect(movieService.getAll).toHaveBeenCalledWith(req.query);
      expect(res.data.message).toBe('Movies fetched successfully');
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle no movies found', async () => {
      movieService.getAll.mockResolvedValue({ data: [] });

      await movieController.fetchAll(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        'No movies found',
        404,
      );
    });

    it('should handle errors when fetching movies', async () => {
      const errorMessage = 'Error fetching movies';
      movieService.getAll.mockRejectedValue(new Error(errorMessage));

      await movieController.fetchAll(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('fetch', () => {
    it('should fetch a movie by ID', async () => {
      const movie = { id: faker.string.uuid(), title: 'Sample Movie' };
      movieService.get.mockResolvedValue(movie);

      req.params.id = faker.string.uuid();

      await movieController.fetch(req, res, next);

      expect(movieService.get).toHaveBeenCalledWith(req.params.id);
      expect(res.data).toEqual(movie);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle movie not found', async () => {
      movieService.get.mockResolvedValue(null);

      req.params.id = faker.string.uuid();

      await movieController.fetch(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        'Movie not found',
        404,
      );
    });

    it('should handle errors when fetching a movie by ID', async () => {
      const errorMessage = 'Error fetching movie';
      movieService.get.mockRejectedValue(new Error(errorMessage));

      await movieController.fetch(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('change', () => {
    it('should update the movie successfully', async () => {
      const updatedMovie = { id: faker.string.uuid(), title: 'Updated Movie' };
      movieService.update.mockResolvedValue(updatedMovie);

      req.params.id = faker.string.uuid();
      req.body = { title: 'Updated Movie' };

      await movieController.change(req, res, next);

      expect(movieService.update).toHaveBeenCalledWith(req.params.id, req.body);
      expect(res.data.message).toBe('Movie updated successfully');
      expect(res.data.movie).toEqual(updatedMovie);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle movie not found during update', async () => {
      movieService.update.mockResolvedValue(null);

      req.params.id = faker.string.uuid();
      req.body = { title: 'Updated Movie' };

      await movieController.change(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        'Movie not found',
        404,
      );
    });

    it('should handle errors during movie update', async () => {
      const errorMessage = 'Error updating movie';
      movieService.update.mockRejectedValue(new Error(errorMessage));

      await movieController.change(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('remove', () => {
    it('should soft delete the movie successfully', async () => {
      movieService.remove.mockResolvedValue();

      req.params.id = faker.string.uuid();

      await movieController.remove(req, res, next);

      expect(movieService.remove).toHaveBeenCalledWith(req.params.id);
      expect(res.data.message).toBe('Movie Soft deleted successfully');
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during movie deletion', async () => {
      const errorMessage = 'Error deleting movie';
      movieService.remove.mockRejectedValue(new Error(errorMessage));

      await movieController.remove(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('getTheatersByMovieId', () => {
    it('should fetch theaters by movie ID successfully', async () => {
      const theaters = [
        { id: faker.string.uuid(), name: 'Theater 1' },
        { id: faker.string.uuid(), name: 'Theater 2' },
      ];

      movieService.getTheatersByMovie.mockResolvedValue(theaters);

      req.params.id = faker.string.uuid();

      await movieController.getTheatersByMovieId(req, res, next);

      expect(movieService.getTheatersByMovie).toHaveBeenCalledWith(
        req.params.id,
      );
      expect(res.data).toEqual(theaters);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle no theaters found for a movie', async () => {
      movieService.getTheatersByMovie.mockResolvedValue([]);

      req.params.id = faker.string.uuid();

      await movieController.getTheatersByMovieId(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        'No theaters found for this movie',
        404,
      );
    });

    it('should handle errors during fetching theaters', async () => {
      const errorMessage = 'Error fetching theaters';
      movieService.getTheatersByMovie.mockRejectedValue(
        new Error(errorMessage),
      );

      await movieController.getTheatersByMovieId(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('fetchAllCast', () => {
    it('should fetch all cast members for a movie', async () => {
      const castMembers = [
        { id: faker.string.uuid(), name: 'Cast Member 1' },
        { id: faker.string.uuid(), name: 'Cast Member 2' },
      ];

      movieService.getCast.mockResolvedValue(castMembers);

      req.params.id = faker.string.uuid();

      await movieController.fetchAllCast(req, res, next);

      expect(movieService.getCast).toHaveBeenCalledWith(req.params.id);
      expect(res.data).toEqual(castMembers);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle no cast members found for a movie', async () => {
      movieService.getCast.mockResolvedValue([]);

      req.params.id = faker.string.uuid();

      await movieController.fetchAllCast(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(
        req,
        res,
        'No cast members found for this movie',
        404,
      );
    });

    it('should handle errors during fetching cast members', async () => {
      const errorMessage = 'Error fetching cast members';
      movieService.getCast.mockRejectedValue(new Error(errorMessage));

      await movieController.fetchAllCast(req, res, next);

      expect(errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });
});
