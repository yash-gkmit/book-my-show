const { City, Movie, Show, Booking, Theater, sequelize } = require('../models');
const { throwCustomError } = require('../helpers/common.helper');
const moment = require('moment');
const { Op } = require('sequelize');
const { parse } = require('json2csv');
const path = require('path');
const fs = require('fs');

const create = async data => {
  const transaction = await sequelize.transaction();

  try {
    const city = await City.create(data, { transaction });

    await transaction.commit();

    return city;
  } catch (error) {
    await transaction.rollback();
    throwCustomError(error);
  }
};

const getAll = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const cities = await City.findAndCountAll({
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    data: cities.rows,
    pagination: {
      totalItems: cities.count,
      currentPage: parseInt(page, 10),
      itemsPerPage: parseInt(limit, 10),
      totalPages: Math.ceil(cities.count / limit),
    },
  };
};

const get = async id => {
  const city = await City.findByPk(id);
  if (!city) throwCustomError('City not found', 404);
  return city;
};

const update = async (id, data) => {
  const transaction = await sequelize.transaction();

  try {
    const city = await City.findByPk(id, { transaction });
    if (!city) {
      await transaction.rollback();
      throwCustomError('City not found', 404);
    }

    await city.update(data, { transaction });

    await transaction.commit();
    return city;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const remove = async id => {
  const transaction = await sequelize.transaction();

  try {
    const city = await City.findByPk(id, { transaction });
    if (!city) {
      await transaction.rollback();
      throwCustomError('City not found', 404);
    }

    await city.destroy({ transaction });

    await transaction.commit();
    return { message: 'City deleted successfully' };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getTheaters = async (id, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  try {
    const theaters = await Theater.findAndCountAll({
      where: { city_id: id },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return {
      data: theaters.rows,
      pagination: {
        totalItems: theaters.count,
        currentPage: parseInt(page, 10),
        itemsPerPage: parseInt(limit, 10),
        totalPages: Math.ceil(theaters.count / limit),
      },
    };
  } catch (error) {
    throw new Error(
      `Error retrieving theaters for city ${cityId}: ${error.message}`,
    );
  }
};

const generateReport = async (city, startDate, endDate) => {
  try {
    const whereClause = {};

    if (startDate && endDate) {
      const parsedStartDate = moment(startDate, 'DD-MM-YYYY').format(
        'YYYY-MM-DD',
      );
      const parsedEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');

      if (
        !moment(parsedStartDate, 'YYYY-MM-DD', true).isValid() ||
        !moment(parsedEndDate, 'YYYY-MM-DD', true).isValid()
      ) {
        throw new Error('Invalid date format. Please use DD-MM-YYYY.');
      }

      whereClause.created_at = {
        [Op.between]: [new Date(parsedStartDate), new Date(parsedEndDate)],
      };
    }

    const movies = await Movie.findAll({
      attributes: ['id', 'name', 'release_date'],
      include: [
        {
          model: Show,
          as: 'shows',
          include: [
            {
              model: Booking,
              as: 'bookings',
              where: whereClause,
              attributes: ['total_amount', 'created_at'],
            },
            {
              model: Theater,
              as: 'theater',
              include: [
                {
                  model: City,
                  as: 'city',
                  where: { name: city },
                  attributes: ['name'],
                },
              ],
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    const reportData = movies.flatMap(movie =>
      movie.shows.map(show => {
        const cityName = show.theater?.city?.name || 'N/A';
        const theaterName = show.theater?.name || 'N/A';

        return {
          movieId: movie.id,
          movieName: movie.name,
          releaseDate: movie.release_date,
          cityName: cityName,
          theaterName: theaterName,
          totalBookings: show.bookings.length,
          totalRevenue: show.bookings.reduce(
            (sum, booking) => sum + booking.total_amount,
            0,
          ),
        };
      }),
    );

    const fields = [
      'movieId',
      'movieName',
      'releaseDate',
      'cityName',
      'theaterName',
      'totalBookings',
      'totalRevenue',
    ];
    const csv = parse(reportData, { fields });

    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const fileName = `city_report_${Date.now()}.csv`;
    const filePath = path.join(reportsDir, fileName);

    fs.writeFileSync(filePath, csv);

    return filePath;
  } catch (error) {
    console.error('Error in generateCityReport:', error);
    throwCustomError(`Failed to generate report: ${error.message}`);
  }
};

module.exports = {
  create,
  getAll,
  get,
  update,
  remove,
  getTheaters,
  generateReport,
};
