const {
  create,
  getAll,
  get,
  update,
  remove,
  generateReport,
  getTheatersByMovie,
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
jest.mock('fs');
jest.mock('path');
jest.mock('json2csv', () => ({
  parse: jest.fn(),
}));

jest.mock('../../src/models', () => ({
  Movie: {
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findAndCountAll: jest.fn(),
    findAll: jest.fn(),
  },
  Theater: {
    findByPk: jest.fn(),
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
    models: {
      Movie: {
        create: jest.fn(),
        findByPk: jest.fn(),
        update: jest.fn(),
      },
      TheaterMovie: {
        bulkCreate: jest.fn(),
      },
    },
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
        poster: faker.image.image(),
        trailer: faker.internet.url(),
        summary: faker.lorem.paragraph(),
        genre: faker.lorem.word(),
        language: faker.lorem.word(),
        castMemberList: [faker.name.firstName(), faker.name.firstName()],
        category: faker.lorem.word(),
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

      const result = await create(movieData, theaterIds);

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

      await expect(create(movieData)).rejects.toEqual('Database error');
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
    it('should return a movie by ID with theaters', async () => {
      const movie = { id: 1, name: faker.lorem.words() };

      // Mock Movie.findByPk instead of Movie.findOne
      Movie.findByPk.mockResolvedValue(movie);

      const result = await get(1);

      expect(Movie.findByPk).toHaveBeenCalledWith(1); // Check that findByPk is called with the correct id
      expect(result).toEqual(movie);
    });

    it('should throw an error if movie not found', async () => {
      Movie.findByPk.mockResolvedValue(null); // Simulate movie not found

      await expect(get(1)).rejects.toEqual('movie not exist with that id!');
    });
  });

  describe('update', () => {
    it('should update a movie', async () => {
      const movie = { id: 1, update: jest.fn() };
      const updatedData = { name: faker.lorem.words() };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      sequelize.transaction.mockResolvedValue(mockTransaction);
      Movie.findByPk.mockResolvedValue(movie);

      const result = await update(1, updatedData);

      expect(movie.update).toHaveBeenCalledWith(updatedData, {
        transaction: mockTransaction,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(movie);
    });

    it('should throw an error if the movie is not found', async () => {
      Movie.findByPk.mockResolvedValue(null);

      await expect(update(1, {})).rejects.toEqual('Movie not found');
    });
  });

  describe('remove', () => {
    it('should soft delete a movie', async () => {
      const movie = { id: 1, destroy: jest.fn() };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      sequelize.transaction.mockResolvedValue(mockTransaction);
      Movie.findByPk.mockResolvedValue(movie);

      const result = await remove(1);

      expect(movie.destroy).toHaveBeenCalledWith({
        transaction: mockTransaction,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual({ message: 'movie soft deleted successfully' });
    });

    it('should throw an error if the movie is not found', async () => {
      Movie.findByPk.mockResolvedValue(null);

      await expect(remove(1)).rejects.toEqual('movie not found');
    });
  });

  describe('getTheatersByMovie', () => {
    it('should return theaters for a given movie', async () => {
      const movie = {
        id: 1,
        theaters: [
          { id: 1, name: faker.lorem.words() },
          { id: 2, name: faker.lorem.words() },
        ],
      };
      Movie.findByPk.mockResolvedValue(movie);

      const result = await getTheatersByMovie(1);

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

      await expect(getTheatersByMovie(1)).rejects.toEqual('movie not found');
    });
  });

  describe('generateReport', () => {
    it('should throw an error for invalid date format', async () => {
      await expect(
        generateReport('invalid-date', '31-12-2023'),
      ).rejects.toThrow('Invalid date format. Please use DD-MM-YYYY.');
    });

    it('should throw an error if start date is after end date', async () => {
      await expect(generateReport('31-12-2023', '01-01-2023')).rejects.toEqual(
        'start date must be before end date.',
      );
    });

    it('should generate a report and return file path', async () => {
      const movieData = {
        id: 1,
        name: 'Test Movie',
        release_date: '2023-12-01',
        shows: [
          {
            bookings: [
              { total_amount: 100, created_at: '2023-12-01' },
              { total_amount: 200, created_at: '2023-12-01' },
            ],
          },
        ],
      };
      Movie.findAll.mockResolvedValue([movieData]);
      Show.findAll.mockResolvedValue(movieData.shows);
      Booking.findAll.mockResolvedValue(movieData.shows[0].bookings);

      const filePath = await generateReport('01-12-2023', '31-12-2023');

      expect(filePath).toMatch(/reports\/report_\d+\.csv/);
    });
  });
});
