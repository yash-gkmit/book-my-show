const { Theater, TheaterMovie, sequelize } = require('../../src/models');
const {
  create,
  getAll,
  get,
  update,
  remove,
  getMovies,
  getReports,
} = require('../../src/services/theaters.service');
const { faker } = require('@faker-js/faker');
const { throwCustomError } = require('../../src/helpers/common.helper');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');

describe('Theater Service', () => {
  const mockTheaterData = {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    city_id: faker.string.uuid(), // Ensure the city_id is included
    address: faker.address.streetAddress(),
  };

  const mockMovieData = {
    id: faker.string.uuid(),
    title: faker.commerce.productName(),
    genre: faker.music.genre(),
  };

  const mockTheaterInstance = {
    id: faker.string.uuid(),
    name: faker.company.name(),
    address: faker.address.streetAddress(),
    city_id: faker.string.uuid(),
    update: jest.fn().mockResolvedValue([1]), // Ensure it's properly initialized
  };

  beforeEach(() => {
    jest.clearAllMocks();

    throwCustomError.mockImplementation((message, status) => {
      const err = new Error(message);
      err.statusCode = status;
      throw err;
    });
  });

  describe('create', () => {
    it('should create a new theater successfully', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      Theater.create.mockResolvedValue(mockTheaterData);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const result = await create(mockTheaterData);

      expect(Theater.create).toHaveBeenCalledWith(mockTheaterData, {
        transaction: mockTransaction,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockTheaterData);
    });

    it('should rollback transaction on error', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      Theater.create.mockRejectedValue(new Error('Database error'));
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(create(mockTheaterData)).rejects.toThrow('Database error');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return a paginated list of theaters', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockTheaters = [mockTheaterData];
      const mockResult = { rows: mockTheaters, count: 1 };
      Theater.findAndCountAll.mockResolvedValue(mockResult);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const result = await getAll(1, 10);

      expect(Theater.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual({
        data: mockTheaters,
        pagination: {
          totalItems: 1,
          currentPage: 1,
          itemsPerPage: 10,
          totalPages: 1,
        },
      });
    });

    it('should return empty data if no theaters found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      Theater.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const result = await getAll(1, 10);

      expect(result).toEqual({
        data: [],
        pagination: {
          totalItems: 0,
          currentPage: 1,
          itemsPerPage: 10,
          totalPages: 0,
        },
      });
    });
  });

  describe('get', () => {
    it('should return a theater by ID', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      Theater.findByPk.mockResolvedValue(mockTheaterData);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const result = await get(mockTheaterData.id);

      expect(Theater.findByPk).toHaveBeenCalledWith(mockTheaterData.id);
      expect(result).toEqual(mockTheaterData);
    });

    it('should throw an error if theater not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      Theater.findByPk.mockResolvedValue(null);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(get(mockTheaterData.id)).rejects.toThrow(
        'Theater not found with that id!',
      );
    });
  });

  describe('update', () => {
    it('should update a theater successfully', async () => {
      const updatedData = { name: faker.company.name() };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      Theater.findByPk.mockResolvedValue(mockTheaterInstance);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const result = await update(mockTheaterInstance.id, updatedData);

      expect(mockTheaterInstance.update).toHaveBeenCalledWith(updatedData, {
        transaction: mockTransaction,
      });

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockTheaterInstance);
    });

    it('should throw an error if theater not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      Theater.findByPk.mockResolvedValue(null);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(
        update(mockTheaterData.id, { name: 'New Name' }),
      ).rejects.toThrow('Theater not found with that id!');
    });

    it('should rollback transaction on error', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockTheaterInstance = {
        update: jest.fn().mockRejectedValue(new Error('Update failed')),
      };
      Theater.findByPk.mockResolvedValue(mockTheaterInstance);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(
        update(mockTheaterData.id, { name: 'New Name' }),
      ).rejects.toThrow('Update failed');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a theater successfully', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockTheaterInstance = { destroy: jest.fn() };
      Theater.findByPk.mockResolvedValue(mockTheaterInstance);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await remove(mockTheaterData.id);

      expect(mockTheaterInstance.destroy).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw an error if theater not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      Theater.findByPk.mockResolvedValue(null);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(remove(mockTheaterData.id)).rejects.toThrow(
        'Theater not found',
      );
    });

    it('should rollback transaction on error', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockTheaterInstance = {
        destroy: jest.fn().mockRejectedValue(new Error('Delete failed')),
      };
      Theater.findByPk.mockResolvedValue(mockTheaterInstance);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(remove(mockTheaterData.id)).rejects.toThrow('Delete failed');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getMovies', () => {
    it('should return movies for a given theater', async () => {
      const mockTheaterId = faker.string.uuid();
      const mockMovies = [mockMovieData];
      const mockCount = 1;

      TheaterMovie.findAndCountAll.mockResolvedValue({
        rows: mockMovies,
        count: mockCount,
      });

      const result = await getMovies(mockTheaterId, 1, 10);

      expect(TheaterMovie.findAndCountAll).toHaveBeenCalledWith({
        where: { theater_id: mockTheaterId },
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual({
        data: mockMovies,
        pagination: {
          totalItems: mockCount,
          currentPage: 1,
          itemsPerPage: 10,
          totalPages: 1,
        },
      });
    });

    it('should throw an error if theater not found', async () => {
      const mockTheaterId = '199f40d5-312d-4420-b4e9-390475ac8bc5';
      Theater.findByPk.mockResolvedValue(null); // Simulate that no theater was found

      // Using regex to match the error message
      await expect(getMovies(mockTheaterId, 1, 10)).rejects.toThrow(
        new RegExp(`Theater with ID ${mockTheaterId} not found`),
      );
    });
  });

  describe('getReports', () => {
    it('should return a list of reports for a theater', async () => {
      const mockTheaterId = faker.string.uuid();
      const mockReports = [
        {
          id: faker.string.uuid(),
          data: 'report data',
          theaterId: mockTheaterId,
          theaterName: 'Test Theater',
          totalBookings: 10,
          totalRevenue: 200,
        },
      ];

      const reports = await getReports(mockTheaterId, 1, 10);

      expect(reports).toEqual(mockReports);
    });
  });
});
