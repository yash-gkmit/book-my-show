const {
  Theater,
  sequelize,
  TheaterMovie,
  Booking,
} = require('../../src/models');
const {
  create,
  getAll,
  get,
  update,
  remove,
  getMovies,
  getReport,
} = require('../../src/services/theaters.service');
const { faker } = require('@faker-js/faker');
const { throwCustomError } = require('../../src/helpers/common.helper');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');

describe('Theater Service', () => {
  const mockTheaterData = {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    city_id: faker.string.uuid(),
    address: faker.address.streetAddress(),
  };

  const mockTheaterInstance = {
    id: faker.string.uuid(),
    name: faker.company.name(),
    address: faker.address.streetAddress(),
    city_id: faker.string.uuid(),
    update: jest.fn().mockResolvedValue([1]),
    destroy: jest.fn().mockResolvedValue(true),
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

    it('should throw an error if the address already exists', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      Theater.findOne.mockResolvedValue(mockTheaterData);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(create(mockTheaterData)).rejects.toThrow(
        'Can not add theater with same address!',
      );
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

      const result = await getAll({ page: 1, limit: 10 });

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

      const result = await getAll({ page: 1, limit: 10 });

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

      const result = await get({ id: mockTheaterData.id });

      expect(Theater.findByPk).toHaveBeenCalledWith(mockTheaterData.id);
      expect(result).toEqual(mockTheaterData);
    });

    it('should throw an error if theater not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      Theater.findByPk.mockResolvedValue(null);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(get({ id: mockTheaterData.id })).rejects.toThrow(
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

      const result = await update({
        id: mockTheaterInstance.id,
        data: updatedData,
      });

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
        update({ id: mockTheaterData.id, data: { name: 'New Name' } }),
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
        update({ id: mockTheaterData.id, data: { name: 'New Name' } }),
      ).rejects.toThrow('Update failed');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a theater successfully', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      Theater.findByPk.mockResolvedValue(mockTheaterInstance);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await remove({ id: mockTheaterData.id });

      expect(mockTheaterInstance.destroy).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw an error if theater not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      Theater.findByPk.mockResolvedValue(null);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(remove({ id: mockTheaterData.id })).rejects.toThrow(
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

      await expect(remove({ id: mockTheaterData.id })).rejects.toThrow(
        'Delete failed',
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getMovies', () => {
    it('should return a list of movies for a theater', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockMovies = [faker.random.alphaNumeric(10)];
      const mockTheaterMovies = [{ movie: mockMovies[0] }];
      Theater.findByPk.mockResolvedValue(mockTheaterData);
      TheaterMovie.findAll.mockResolvedValue(mockTheaterMovies);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const result = await getMovies({
        id: mockTheaterData.id,
        query: { page: 1, limit: 10 },
      });

      expect(Theater.findByPk).toHaveBeenCalledWith(mockTheaterData.id);
      expect(TheaterMovie.findAll).toHaveBeenCalled();
      expect(result.data).toEqual(mockMovies);
    });

    it('should throw an error if theater not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      Theater.findByPk.mockResolvedValue(null);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(getMovies({ id: mockTheaterData.id })).rejects.toThrow(
        'Theater not found with that id!',
      );
    });
  });

  describe('getReport', () => {
    it('should return a report for a theater', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockReport = {
        bookings: [{ id: 1, movie: 'Inception', quantity: 3 }],
        totalRevenue: 1000,
      };
      Theater.findByPk.mockResolvedValue(mockTheaterData);
      Booking.findAll.mockResolvedValue(mockReport.bookings);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const result = await getReport({
        id: mockTheaterData.id,
        dateRange: { start: '2024-01-01', end: '2024-01-31' },
      });

      expect(result).toEqual(mockReport);
    });

    it('should throw an error if theater not found for report', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      Theater.findByPk.mockResolvedValue(null);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(
        getReport({
          id: mockTheaterData.id,
          dateRange: { start: '2024-01-01', end: '2024-01-31' },
        }),
      ).rejects.toThrow('Theater not found with that id!');
    });
  });
});
