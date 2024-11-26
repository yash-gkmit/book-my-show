const { City, Movie, Show, Booking, Theater } = require('../models');
const { throwCustomError } = require('../helpers/common.helper');
const moment = require('moment');
const { Op } = require('sequelize');
const { parse } = require('json2csv');
const path = require('path');
const fs = require('fs');

const create = async payload => {
  const { name } = payload;

  const isCityExist = await City.findOne({
    where: { name: name },
  });

  if (isCityExist) {
    throwCustomError('City already exist!', 400);
  }
  const city = await City.create(payload);

  return city;
};

const getAll = async payload => {
  const { page = 1, limit = 10 } = payload;
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

const get = async payload => {
  const { id } = payload;
  const city = await City.findByPk(id);
  if (!city) throwCustomError('City not found', 404);
  return city;
};

const update = async payload => {
  const { id } = payload.id;
  const data = payload.data;
  const city = await City.findByPk(id, { transaction });
  if (!city) {
    throwCustomError('City not found', 404);
  }

  await city.update(data, { transaction });
  await transaction.commit();
  return city;
};

const remove = async payload => {
  const id = payload;

  const city = await City.findByPk(id, { transaction });
  if (!city) {
    await transaction.rollback();
    throwCustomError('City not found', 404);
  }

  await city.destroy();
};

const getTheaters = async (id, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const theaters = await Theater.findAndCountAll({
    where: { city_id: id },
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  console.log(theaters);
  return {
    data: theaters.rows,
    pagination: {
      totalItems: theaters.count,
      currentPage: parseInt(page, 10),
      itemsPerPage: parseInt(limit, 10),
      totalPages: Math.ceil(theaters.count / limit),
    },
  };
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
        return {
          movieId: movie.id,
          movieName: movie.name,
          releaseDate: movie.release_date,
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
    console.error('error in generateCityReport:', error);
    throwCustomError(`failed to generate report: ${error.message}`);
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
