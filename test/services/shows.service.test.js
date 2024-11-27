const { Show, Movie, Theater, sequelize } = require('../../src/models');
const showService = require('../../src/services/shows.service');
const { throwCustomError } = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');
const { Op } = require('sequelize');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');

describe('Show Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    throwCustomError.mockImplementation((message, status) => {
      const err = new Error(message);
      err.statusCode = status;
      throw err;
    });
  });

  describe('create', () => {
    it('should create a new show and commit the transaction', async () => {
      const fakeTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(fakeTransaction);

      // Use camelCase for the dummyData
      const dummyData = {
        movieId: faker.string.uuid(),
        theaterId: faker.string.uuid(),
        showTime: faker.date.future(),
        availableSeats: faker.number.int(),
        type: faker.lorem.word(),
        price: faker.commerce.price(),
      };

      // Transform the dummyData to match the snake_case attributes of the model
      const transformedData = {
        movie_id: dummyData.movieId,
        theater_id: dummyData.theaterId,
        show_time: dummyData.showTime,
        available_seats: dummyData.availableSeats,
        type: dummyData.type,
        price: dummyData.price,
      };

      // Mock the `Show.create` method to resolve with transformedData
      Show.create.mockResolvedValue(transformedData);

      const result = await showService.create(dummyData);

      // Ensure the transformed data is passed to `Show.create`
      expect(Show.create).toHaveBeenCalledWith(transformedData, {
        transaction: fakeTransaction,
      });
      expect(fakeTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(transformedData);
    });
  });

  describe('getAll', () => {
    it('should return a paginated list of shows', async () => {
      const dummyData = [
        {
          id: faker.string.uuid(),
          movie_id: faker.string.uuid(),
          theater_id: faker.string.uuid(),
          start_time: faker.date.future(),
          end_time: faker.date.future(),
        },
      ];

      const filters = { theater_id: faker.string.uuid() };

      const processedFilters = {
        theater_id: { [Op.eq]: filters.theater_id },
      };

      Show.findAndCountAll.mockResolvedValue({
        rows: dummyData,
        count: dummyData.length,
      });

      const result = await showService.getAll(filters, 1, 10);

      expect(Show.findAndCountAll).toHaveBeenCalledWith({
        where: processedFilters,
        include: [
          { model: Movie, as: 'movie' },
          { model: Theater, as: 'theater' },
        ],
        limit: 10,
        offset: 0,
        order: [['created_at', 'DESC']],
      });

      expect(result.data).toEqual(dummyData);
      expect(result.pagination).toEqual({
        totalItems: dummyData.length,
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1,
      });
    });
  });

  describe('get', () => {
    it('should return a show if it exists', async () => {
      const dummyData = {
        id: faker.string.uuid(),
        movie_id: faker.string.uuid(),
        theater_id: faker.string.uuid(),
        start_time: faker.date.future(),
      };

      Show.findByPk.mockResolvedValue(dummyData);

      const result = await showService.get(dummyData.id);

      expect(Show.findByPk).toHaveBeenCalledWith(dummyData.id);
      expect(result).toEqual(dummyData);
    });

    it('should throw an error if show does not exist', async () => {
      Show.findByPk.mockResolvedValue(null);

      await expect(showService.get(faker.string.uuid())).rejects.toThrow(
        'Show not available for that id',
      );
    });
  });

  describe('update', () => {
    it('should update a show if it exists', async () => {
      const fakeTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(fakeTransaction);

      const dummyData = {
        id: faker.string.uuid(),
        movie_id: faker.string.uuid(),
      };

      const updateData = {
        start_time: faker.date.future(),
      };

      Show.findByPk.mockResolvedValue({
        ...dummyData,
        update: jest.fn().mockResolvedValue(updateData),
      });

      const result = await showService.update({
        id: { id: dummyData.id },
        data: updateData,
      });

      // expect(Show.findByPk).toHaveBeenCalledWith(dummyData.id, {
      //   transaction: fakeTransaction,
      // });
      expect(result.update).toHaveBeenCalled(updateData, {
        transaction: fakeTransaction,
      });
      expect(fakeTransaction.commit).toHaveBeenCalled();
    });

    it('should throw an error if the show does not exist', async () => {
      Show.findByPk.mockResolvedValue(null);

      await expect(
        showService.update({
          id: { id: faker.string.uuid() },
          data: { start_time: faker.date.future() },
        }),
      ).rejects.toThrow('Show not available for that id');
    });
  });

  describe('remove', () => {
    it('should delete a show if it exists', async () => {
      const dummyData = {
        id: faker.string.uuid(),
        destroy: jest.fn(),
      };

      Show.findByPk.mockResolvedValue(dummyData);

      const result = await showService.remove(dummyData.id);

      expect(Show.findByPk).toHaveBeenCalled(dummyData.id);

      expect(dummyData.destroy).toHaveBeenCalledWith();

      expect(result).toEqual({ message: 'show successfully deleted' });
    });
  });
});
