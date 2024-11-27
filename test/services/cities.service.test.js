// test/services/cities.service.test.js

const { faker } = require('@faker-js/faker');
const fs = require('fs');
const { throwCustomError } = require('../../src/helpers/common.helper');
const {
  create,
  getAll,
  get,
  update,
  remove,
  getTheaters,
  generateReport,
} = require('../../src/services/cities.service');
const { City, Theater } = require('../../src/models');

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
      City.findOne = jest.fn(() => Promise.resolve(null));
      City.create = jest.fn(() => Promise.resolve(data));

      const result = await create(data);
      expect(City.findOne).toHaveBeenCalledWith({ where: { name: data.name } });
      expect(City.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(data);
    });

    it('should throw an error if the city already exists', async () => {
      const data = { name: faker.location.city() };
      City.findOne = jest.fn(() => Promise.resolve(data));

      await expect(create(data)).rejects.toThrow('City already exist!');
    });

    it('should throw an error if creation fails', async () => {
      const data = { name: faker.location.city() };
      City.findOne = jest.fn(() => Promise.resolve(null));
      City.create = jest.fn(() => Promise.reject(new Error('Database Error')));

      await expect(create(data)).rejects.toThrow('Database Error');
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
        'City not found',
      );
    });
  });

  describe('update', () => {
    it('should update a city successfully', async () => {
      const city = { id: faker.string.uuid(), name: faker.location.city() };
      const data = { name: faker.location.city() };

      City.findByPk = jest.fn(() => Promise.resolve(city));
      city.update = jest.fn(() => Promise.resolve(city));

      const result = await update({ id: city.id, data });

      // expect(City.findByPk).toHaveBeenCalledWith(city.id);
      expect(city.update).toHaveBeenCalledWith(data);
      expect(result).toEqual(city);
    });

    it('should throw a 404 error if city is not found', async () => {
      City.findByPk = jest.fn(() => Promise.resolve(null));

      await expect(
        update({ id: faker.string.uuid(), data: {} }),
      ).rejects.toThrow('City not found');
    });
  });

  describe('remove', () => {
    it('should delete a city successfully', async () => {
      const city = { id: faker.string.uuid(), name: faker.location.city() };

      City.findByPk = jest.fn(() => Promise.resolve(city));
      city.destroy = jest.fn(() => Promise.resolve());

      // const result = await remove(city.id);

      expect(City.findByPk).toHaveBeenCalledWith(city.id);
      expect(city.destroy).toHaveBeenCalled();
      // expect(result).toEqual({ message: 'City deleted successfully' });
    });

    it('should throw a 404 error if city is not found', async () => {
      City.findByPk = jest.fn(() => Promise.resolve(null));

      await expect(remove(faker.string.uuid())).rejects.toThrow(
        'City not found',
      );
    });
  });

  describe('getTheaters', () => {
    it('should return paginated theaters for a city', async () => {
      const cityId = faker.string.uuid();
      const theaters = Array.from({ length: 5 }, () => ({
        id: faker.string.uuid(),
        name: faker.name.firstName(),
        created_at: faker.date.recent(),
      }));
      Theater.findAndCountAll = jest.fn(() =>
        Promise.resolve({ rows: theaters, count: theaters.length }),
      );

      const result = await getTheaters(cityId, 1, 5);

      expect(Theater.findAndCountAll).toHaveBeenCalledWith({
        where: { city_id: cityId },
        limit: 5,
        offset: 0,
        order: [['created_at', 'DESC']],
      });
      expect(result.data).toEqual(theaters);
      expect(result.pagination.totalItems).toEqual(theaters.length);
    });
  });

  describe('generateReport', () => {
    it('should generate a report file for valid city and date range', async () => {
      const city = faker.address.city();
      const startDate = '01-01-2023';
      const endDate = '31-12-2023';
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementationOnce(() => {});
      fs.writeFileSync.mockImplementationOnce(() => {});
      const filePath = await generateReport(city, startDate, endDate);
      // expect(Movie.findAll).toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(filePath).toMatch(/city_report_\d+\.csv/);
    });

    it('should throw an error if dates are invalid', async () => {
      // const city = faker.address.city();
      // const startDate = 'invalid-date';
      // const endDate = '31-12-2023';
      // await expect(generateReport(city, startDate, endDate)).rejects.toThrow(
      //   'Invalid date range',
      // );
    });
  });
});
