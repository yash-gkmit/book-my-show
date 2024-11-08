'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TheaterMovie extends Model {
    static associate(models) {
      TheaterMovie.belongsTo(models.Movie, {
        foreignKey: 'movie_id',
        as: 'movie',
      });

      TheaterMovie.belongsTo(models.Theater, {
        foreignKey: 'theater_id',
        as: 'theater',
      });
    }
  }
  TheaterMovie.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      movie_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      theater_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'TheatersMovies',
      tableName: 'theaters_movies',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    },
  );
  return TheaterMovie;
};
