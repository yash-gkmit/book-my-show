const { faker } = require('@faker-js/faker');

const fs = require('fs');

const {
  create,
  getAll,
  get,
  update,
  remove,
  generateReport,
} = require('../../src/services/cities.service');
const { City, Movie, sequelize } = require('../../src/models');
const { throwCustomError } = require('../../src/helpers/common.helper');

jest.mock('../../src/models', () => ({
  City: jest.fn().mockImplementation(() => ({})),
  Movie: jest.fn().mockImplementation(() => ({})),
  Show: jest.fn().mockImplementation(() => ({})),
  Booking: jest.fn().mockImplementation(() => ({})),
  Theater: jest.fn().mockImplementation(() => ({})),
  models: {
    City: {
      findByPk: jest.fn(),
      create: jest.fn(),
      findAndCountAll: jest.fn(),
      findOne: jest.fn(),
    },
    Movie: {
      findAll: jest.fn(),
    },
    Show: {
      findAll: jest.fn(),
    },
    Booking: {
      findAll: jest.fn(),
    },
    Theater: {
      findAndCountAll: jest.fn(),
    },
  },
  sequelize: {
    transaction: jest.fn(),
  },
}));
jest.mock('fs');
jest.mock('json2csv');
jest.mock('../../src/helpers/common.helper');

beforeEach(() => {
  throwCustomError.mockImplementation((message, status) => {
    const err = new Error(message);
    err.statusCode = status;
    throw err;
  });
});

describe('City Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new city successfully', async () => {
      const data = { name: faker.location.city() };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      sequelize.transaction = jest.fn(() => mockTransaction);
      City.findOne = jest.fn(() => Promise.resolve(null));
      City.create = jest.fn(() => Promise.resolve(data));

      const result = await create(data);

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(City.findOne).toHaveBeenCalledWith({ where: { name: data.name } });
      expect(City.create).toHaveBeenCalledWith(data, {
        transaction: mockTransaction,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(data);
    });

    it('should throw an error if the city already exists', async () => {
      const data = { name: faker.location.city() };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      sequelize.transaction = jest.fn(() => mockTransaction);
      City.findOne = jest.fn(() => Promise.resolve(data));

      await expect(create(data)).rejects.toThrow('city already exist!');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should roll back and throw an error if creation fails', async () => {
      const data = { name: faker.location.city() };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      sequelize.transaction = jest.fn(() => mockTransaction);
      City.findOne = jest.fn(() => Promise.resolve(null));
      City.create = jest.fn(() => Promise.reject(new Error('Database Error')));

      await expect(create(data)).rejects.toThrow('Database Error');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return paginated list of cities', async () => {
      const cities = Array.from({ length: 5 }, () => ({
        id: faker.string.uuid(),
        name: faker.location.city(),
        created_at: faker.date.recent(),
      }));
      City.findAndCountAll = jest.fn(() =>
        Promise.resolve({ rows: cities, count: cities.length }),
      );

      const result = await getAll({ page: 1, limit: 5 });

      expect(City.findAndCountAll).toHaveBeenCalledWith({
        limit: 5,
        offset: 0,
        order: [['created_at', 'DESC']],
      });
      expect(result.data).toEqual(cities);
      expect(result.pagination.totalItems).toEqual(cities.length);
    });
  });

  describe('get', () => {
    it('should return a city by ID', async () => {
      const city = { id: faker.string.uuid(), name: faker.location.city() };
      City.findByPk = jest.fn(() => Promise.resolve(city));

      const result = await get({ id: city.id });

      expect(City.findByPk).toHaveBeenCalledWith(city.id);
      expect(result).toEqual(city);
    });

    it('should throw a 404 error if city is not found', async () => {
      City.findByPk = jest.fn(() => Promise.resolve(null));

      await expect(get({ id: faker.string.uuid() })).rejects.toThrow(
        'city not found',
      );
    });
  });

  describe('update', () => {
    it('should update a city successfully', async () => {
      const city = { id: faker.string.uuid(), name: faker.location.city() };
      const data = { name: faker.location.city() };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      sequelize.transaction = jest.fn(() => mockTransaction);
      City.findByPk = jest.fn(() => Promise.resolve(city));
      city.update = jest.fn(() => Promise.resolve(city));

      const result = await update({ id: city.id, data });

      expect(City.findByPk).toHaveBeenCalledWith(city.id, {
        transaction: mockTransaction,
      });
      expect(city.update).toHaveBeenCalledWith(data, {
        transaction: mockTransaction,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(city);
    });

    it('should throw a 404 error if city is not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      sequelize.transaction = jest.fn(() => mockTransaction);
      City.findByPk = jest.fn(() => Promise.resolve(null));

      await expect(
        update({ id: faker.string.uuid(), data: {} }),
      ).rejects.toThrow('city not found');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a city successfully', async () => {
      const city = { id: faker.string.uuid(), name: faker.location.city() };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      sequelize.transaction = jest.fn(() => mockTransaction);
      City.findByPk = jest.fn(() => Promise.resolve(city));
      city.destroy = jest.fn(() => Promise.resolve());

      const result = await remove(city.id);

      expect(City.findByPk).toHaveBeenCalledWith(city.id, {
        transaction: mockTransaction,
      });
      expect(city.destroy).toHaveBeenCalledWith({
        transaction: mockTransaction,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual({ message: 'city deleted successfully' });
    });

    it('should throw a 404 error if city is not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      sequelize.transaction = jest.fn(() => mockTransaction);
      City.findByPk = jest.fn(() => Promise.resolve(null));

      await expect(remove(faker.string.uuid())).rejects.toThrow(
        'City not found',
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('generateReport', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should generate a report file for valid city and date range', async () => {
      const city = faker.address.city();
      const startDate = '01-01-2023';
      const endDate = '31-12-2023';
      const mockMovies = [
        {
          id: faker.string.uuid(),
          name: faker.commerce.productName(),
          release_date: faker.date.past(),
          shows: [
            {
              bookings: [{ total_amount: 100 }, { total_amount: 200 }],
            },
          ],
        },
      ];

      // Movie.findAll.mockResolvedValueOnce(mockMovies);
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementationOnce(() => {});
      fs.writeFileSync.mockImplementationOnce(() => {});

      const filePath = await generateReport(city, startDate, endDate);

      expect(Movie.findAll).toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(filePath).toMatch(/city_report_\d+\.csv/);
    });

    it('should throw an error if dates are invalid', async () => {
      const city = faker.address.city();
      const startDate = 'invalid-date';
      const endDate = '31-12-2023';

      await expect(generateReport(city, startDate, endDate)).rejects.toThrow(
        'Invalid date format',
      );
    });

    it('should handle cases where no movies are found', async () => {
      const city = faker.address.city();
      const startDate = '01-01-2023';
      const endDate = '31-12-2023';

      // Movie.findAll.mockResolvedValueOnce([]);

      const filePath = await generateReport(city, startDate, endDate);

      expect(Movie.findAll).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(filePath).toMatch(/city_report_\d+\.csv/);
    });
  });
});
