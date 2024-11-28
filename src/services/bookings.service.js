const { Booking, Show, Movie, sequelize } = require('../models');
const { throwCustomError } = require('../helpers/common.helper');

const create = async payload => {
  const { id } = payload.id;
  const data = payload.body;
  console.log(data);

  const show = await Show.findByPk(data.showId);
  if (!show) {
    throwCustomError('Show not found', 404);
  }

  if (show.available_seats < data.number_of_seats) {
    throwCustomError('Seats not available', 404);
  }

  const showtimeDate = new Date(show.time);
  console.log(showtimeDate);
  const bookingDateDate = new Date(data.bookingDate);
  console.log(bookingDateDate);
  if (showtimeDate.toDateString() !== bookingDateDate.toDateString()) {
    throwCustomError(`Show not available for that date`, 400);
  }

  const bookingData = {
    user_id: id,
    show_id: data.showId,
    number_of_seats: data.numberOfSeats,
    total_amount: data.numberOfSeats * show.price,
    status: 'Pending',
    booking_date: data.bookingDate,
  };

  const booking = await Booking.create(bookingData);

  if (show.available_seats > data.number_of_seats) {
    show.available_seats -= data.number_of_seats;
    await show.save();
  }
  return booking;
};

const getAll = async payload => {
  const { page = 1, limit = 10, ...filters } = payload;
  const whereConditions = {};
  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Booking.rawAttributes).includes(key)) {
      whereConditions[key] = { [Op.eq]: value };
    }
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await Booking.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: Show,
        as: 'show',
        include: [{ model: Movie, as: 'movie' }],
      },
    ],
    order: [['created_at', 'DESC']],
    offset,
    limit: parseInt(limit, 10),
  });

  return {
    data: rows,
    pagination: {
      totalItems: count,
      currentPage: parseInt(page, 10),
      itemsPerPage: parseInt(limit, 10),
      totalPages: Math.ceil(count / limit),
    },
  };
};

const get = async payload => {
  const { id } = payload;
  const booking = Booking.findByPk(id);
  if (!booking) {
    throwCustomError('Booking not found', 404);
  }

  return booking;
};

const update = async payload => {
  const { id } = payload;
  const data = payload.body;

  const booking = await Booking.findByPk(id);
  const show = await Show.findOne({ where: { id: booking.show_id } });

  if (!booking) {
    throwCustomError('Booking not found', 404);
  }

  if (booking.booking_status === 'Confirmed') {
    throwCustomError('Not allowed to upadte confirmed booking', 400);
  }

  if (!show) {
    throwCustomError('Show not found', 404);
  }

  const snakeCasePayload = {};
  for (const key in data) {
    const snakeKey = key.replace(
      /[A-Z]/g,
      letter => `_${letter.toLowerCase()}`,
    );
    snakeCasePayload[snakeKey] = data[key];
  }

  if (snakeCasePayload.number_of_seats) {
    const newTotalAmount = snakeCasePayload.number_of_seats * show.price;
    booking.total_amount = newTotalAmount;
    await booking.save();
  }

  await booking.update(snakeCasePayload);

  return booking;
};

const remove = async payload => {
  const { id } = payload;

  const booking = await Booking.findByPk(id);

  if (!booking) {
    throwCustomError('Booking not found', 404);
  }

  if (booking.booking_status === 'Confirmed') {
    throwCustomError('Sold out ticket can not be refunded or exchanged!', 400);
  }
  await Booking.update(
    { booking_status: 'Canceled' },
    {
      where: {
        id: id,
      },
    },
  );
  await booking.destroy();
};

const getReport = async () => {
  const totalBookings = await Booking.count();
  const revenueGenerated = await Booking.sum('total_amount');

  const mostBookedMovies = await Booking.findAll({
    attributes: [
      [sequelize.col('show.id'), 'show_id'],
      [sequelize.col('show.movie.id'), 'movie_id'],
      [sequelize.col('show.movie.name'), 'movie_name'],
      [sequelize.fn('COUNT', sequelize.col('Booking.id')), 'booking_count'],
    ],
    include: [
      {
        model: Show,
        as: 'show',
        attributes: [],
        include: [
          {
            model: Movie,
            as: 'movie',
            attributes: [],
          },
        ],
      },
    ],
    group: ['show.id', 'show.movie.id', 'show.movie.name'],
    order: [[sequelize.fn('COUNT', sequelize.col('Booking.id')), 'DESC']],
    limit: 5,
  });

  return {
    totalBookings,
    revenueGenerated,
    BookedMovies: mostBookedMovies.map(movie => ({
      showId: movie.get('show_id'),
      movieId: movie.get('movie_id'),
      movieName: movie.get('movie_name'),
      bookingCount: movie.get('booking_count'),
    })),
  };
};

module.exports = {
  create,
  getAll,
  get,
  update,
  remove,
  getReport,
};
