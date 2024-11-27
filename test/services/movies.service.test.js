const {
  create,
  getAll,
  get,
  update,
  remove,
  getTheatersByMovieId,
  getReport,
} = require('../../src/services/movies.service');
const {
  Movie,
  Theater,
  TheaterMovie,
  Show,
  Booking,
  sequelize,
} = require('../../src/models');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

jest.mock('fs');
jest.mock('path');
jest.mock('json2csv', () => ({
  parse: jest.fn(),
}));

jest.mock('../../src/models', () => ({
  Movie: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  Theater: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
  TheaterMovie: {
    bulkCreate: jest.fn(),
    update: jest.fn(),
  },
  Show: {
    findAll: jest.fn(),
  },
  Booking: {
    findAll: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn(),
    }),
  },
}));

describe('Movie Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a movie with associated theaters', async () => {
      const movieData = {
        name: faker.lorem.words(),
        releaseDate: faker.date.future(),
        poster: faker.image.imageUrl(),
        trailer: faker.internet.url(),
        summary: faker.lorem.paragraph(),
        genre: faker.lorem.word(),
        language: faker.lorem.word(),
        castMemberList: [faker.name.firstName(), faker.name.firstName()],
        category: faker.lorem.word(),
        duration: 120,
      };
      const theaterIds = [1, 2, 3];
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      sequelize.transaction.mockResolvedValue(mockTransaction);
      Movie.create.mockResolvedValue({ id: 1, ...movieData });
      TheaterMovie.bulkCreate.mockResolvedValue();
      Movie.findByPk.mockResolvedValue({
        id: 1,
        ...movieData,
        theaters: theaterIds,
      });

      const result = await create(theaterIds, movieData);

      expect(Movie.create).toHaveBeenCalledWith(movieData, {
        transaction: mockTransaction,
      });
      expect(TheaterMovie.bulkCreate).toHaveBeenCalledWith(
        theaterIds.map(id => ({ movie_id: 1, theater_id: id })),
        { transaction: mockTransaction },
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, ...movieData, theaters: theaterIds });
    });

    it('should rollback the transaction if an error occurs', async () => {
      const movieData = {
        name: faker.lorem.words(),
        releaseDate: faker.date.future(),
      };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      sequelize.transaction.mockResolvedValue(mockTransaction);
      Movie.create.mockRejectedValue(new Error('Database error'));

      await expect(create([], movieData)).rejects.toThrow('Database error');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return paginated movies with filters', async () => {
      const movies = Array.from({ length: 3 }, () => ({
        id: faker.string.numeric(),
        name: faker.lorem.words(),
        cast_member_list: [faker.name.firstName(), faker.name.firstName()],
      }));

      Movie.findAndCountAll.mockResolvedValue({ count: 3, rows: movies });

      const result = await getAll({ page: 1, limit: 2 });
      expect(Movie.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 2,
        offset: 0,
      });

      expect(result).toEqual({
        data: movies,
        pagination: {
          totalItems: 3,
          currentPage: 1,
          itemsPerPage: 2,
          totalPages: 2,
        },
      });
    });
  });

  describe('get', () => {
    it('should return a movie by ID', async () => {
      const movie = { id: 1, name: faker.lorem.words() };

      Movie.findByPk.mockResolvedValue(movie);

      const result = await get({ id: 1 });

      expect(Movie.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(movie);
    });

    it('should throw an error if movie not found', async () => {
      Movie.findOne.mockResolvedValue(null);

      await expect(get({ id: 1 })).rejects.toThrow(
        'Movie not exist with that id!',
      );
    });
  });

  describe('update', () => {
    it('should update a movie', async () => {
      const movie = { id: 1, update: jest.fn() };
      const updatedData = { name: faker.lorem.words() };

      Movie.findByPk.mockResolvedValue(movie);
      const result = await update({ id: 1, body: updatedData });

      expect(movie.update).toHaveBeenCalledWith(updatedData);
      expect(result).toEqual(movie);
    });

    it('should throw an error if the movie is not found', async () => {
      Movie.findByPk.mockResolvedValue(null);

      await expect(update({ id: 1, body: {} })).rejects.toThrow(
        'Movie not found',
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a movie', async () => {
      const movie = { id: 1, destroy: jest.fn() };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      sequelize.transaction.mockResolvedValue(mockTransaction);
      Movie.findByPk.mockResolvedValue(movie);

      const result = await remove({ id: 1 });

      expect(movie.destroy).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual({ message: 'movie soft deleted successfully' });
    });

    it('should throw an error if the movie is not found', async () => {
      Movie.findByPk.mockResolvedValue(null);

      await expect(remove({ id: 1 })).rejects.toThrow('movie not found');
    });
  });

  describe('getTheatersByMovieId', () => {
    it('should return theaters for a given movie', async () => {
      const movie = {
        id: 1,
        theaters: [
          { id: 1, name: faker.lorem.words() },
          { id: 2, name: faker.lorem.words() },
        ],
      };
      Movie.findByPk.mockResolvedValue(movie);

      const result = await getTheatersByMovieId({ id: 1 });

      expect(Movie.findByPk).toHaveBeenCalledWith(1, {
        include: {
          model: Theater,
          as: 'theaters',
          through: { attributes: [] },
        },
      });
      expect(result).toEqual(movie.theaters);
    });

    it('should throw an error if the movie is not found', async () => {
      Movie.findByPk.mockResolvedValue(null);

      await expect(getTheatersByMovieId({ id: 1 })).rejects.toThrow(
        'movie not found',
      );
    });
  });

  describe('getReport', () => {
    it('should throw an error if start date is after end date', async () => {
      await expect(
        getReport({ startDate: '31-12-2023', endDate: '01-01-2023' }),
      ).rejects.toThrow('start date must be before end date.');
    });

    it('should generate a report and return the file path', async () => {
      const movieData = {
        id: 1,
        name: 'Test Movie',
        release_date: '2023-12-01',
        shows: [
          {
            id: 1,
            bookings: [
              { total_amount: 100, created_at: '2023-12-01' },
              { total_amount: 200, created_at: '2023-12-01' },
            ],
          },
        ],
      };

      Movie.findAll.mockResolvedValue([movieData]);
      const mockFilePath = 'reports/test_report.csv';
      parse.mockReturnValue('csv_content');
      fs.writeFileSync.mockImplementation(() => {});

      const result = await getReport({
        startDate: '01-12-2023',
        endDate: '31-12-2023',
      });

      expect(result).toBe(mockFilePath);
    });
  });
});
