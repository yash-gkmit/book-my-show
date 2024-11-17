const {
  Movie,
  Theater,
  Show,
  TheaterMovie,
  Booking,
  sequelize,
} = require('../models');
const { throwCustomError } = require('../helpers/common.helper');
const { parse } = require('json2csv');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

const create = async (movieData, theaterIds) => {
  const transaction = await sequelize.transaction();

  try {
    const movie = await Movie.create(movieData, { transaction });

    if (theaterIds && theaterIds.length > 0) {
      const theaterAssociations = theaterIds.map(theaterId => ({
        movie_id: movie.id,
        theater_id: theaterId,
      }));
      console.log(theaterAssociations);

      await TheaterMovie.bulkCreate(theaterAssociations, { transaction });
    }

    await transaction.commit();

    const movieWithTheaters = await Movie.findByPk(movie.id, {
      include: {
        model: Theater,
        as: 'theaters',
        through: { attributes: [] },
      },
    });

    return movieWithTheaters;
  } catch (error) {
    await transaction.rollback();
    throwCustomError(error.message);
  }
};

const getAll = async query => {
  const { page = 1, limit = 10, cast_member_list, ...filters } = query;

  const offset = (page - 1) * limit;
  const whereConditions = {};

  if (cast_member_list) {
    if (Array.isArray(cast_member_list)) {
      whereConditions.cast_member_list = { [Op.contains]: cast_member_list };
    } else {
      whereConditions.cast_member_list = { [Op.eq]: cast_member_list };
    }
  }

  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Movie.rawAttributes).includes(key)) {
      if (Array.isArray(value)) {
        whereConditions[key] = { [Op.in]: value };
      } else {
        whereConditions[key] = { [Op.eq]: value };
      }
    }
  }

  const movies = await Movie.findAndCountAll({
    where: whereConditions,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  });

  return {
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(movies.count / limit),
    totalRecords: movies.count,
    data: movies.rows,
  };
};

const getById = async movieId => {
  return await Movie.findByPk(movieId, {
    include: {
      model: Theater,
      as: 'theaters',
      through: { attributes: [] },
    },
  });
};

const update = async (movieId, movieData) => {
  const transaction = await sequelize.transaction();

  try {
    const movie = await Movie.findByPk(movieId, { transaction });

    if (!movie) {
      throwCustomError('Movie not found', 404);
    }

    await movie.update(movieData, { transaction });

    await transaction.commit();

    return movie;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const remove = async movieId => {
  const transaction = await sequelize.transaction();

  try {
    const movie = await Movie.findByPk(movieId, { transaction });
    if (!movie) {
      throwCustomError('Movie not found', 404);
    }

    await movie.destroy({ transaction });

    await TheaterMovie.update(
      { deleted_at: new Date() },
      { where: { movie_id: movieId }, individualHooks: true, transaction },
    );

    await transaction.commit();

    return { message: 'Movie soft deleted successfully' };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getTheatersByMovie = async movieId => {
  const movie = await Movie.findByPk(movieId, {
    include: {
      model: Theater,
      as: 'theaters',
      through: { attributes: [] },
    },
  });

  if (!movie) {
    throwCustomError('Movie not found', 404);
  }

  return movie.theaters;
};

const generateReport = async (startDate, endDate) => {
  try {
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const movies = await Movie.findAll({
      include: {
        model: Show,
        as: 'shows',
        include: {
          model: Booking,
          as: 'bookings',
          where: whereClause,
          attributes: ['total_amount', 'created_at'],
        },
      },
    });

    const reportData = movies.map(movie => ({
      movieId: movie.id,
      movieName: movie.name,
      totalBookings: movie.shows.reduce(
        (sum, show) => sum + show.bookings.length,
        0,
      ),
      totalRevenue: movie.shows.reduce(
        (sum, show) =>
          sum +
          show.bookings.reduce((acc, booking) => acc + booking.total_amount, 0),
        0,
      ),
    }));

    const fields = ['movieId', 'movieName', 'totalBookings', 'totalRevenue'];
    const csv = parse(reportData, { fields });

    // Path to save the report
    const reportsDir = path.join(__dirname, '../reports');
    console.log('Reports directory path:', reportsDir); // Debugging

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const fileName = `report_${Date.now()}.csv`;
    const filePath = path.join(reportsDir, fileName);
    console.log('Generated file path:', filePath); // Debugging

    fs.writeFileSync(filePath, csv);
    console.log('CSV successfully written to:', filePath); // Debugging

    return filePath; // Ensure filePath is returned
  } catch (error) {
    console.error('Error in generateReport:', error.stack);
    throw new Error(`Failed to generate report: ${error.message}`);
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getTheatersByMovie,
  generateReport,
};
