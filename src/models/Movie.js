'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Movie extends Model {
    static associate(models) {
      Movie.belongsToMany(models.Theater, {
        through: 'theaters_movies',
        foreignKey: 'movie_id',
        otherKey: 'theater_id',
        as: 'theaters',
      });

      Movie.hasMany(models.Movieshow, {
        foreignKey: 'movie_id',
        as: 'movieShows',
      });
    }
  }
  Movie.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      releaseDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      castMemberList: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
      genre: {
        type: DataTypes.ENUM(
          'Action',
          'Comedy',
          'Drama',
          'Horror',
          'Sci-Fi',
          'Romance',
        ),
        allowNull: false,
      },
      language: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      poster: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      trailer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Movie',
      tableName: 'movies',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    },
  );

  return Movie;
};
