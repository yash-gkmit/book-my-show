'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Theater extends Model {
    static associate(models) {
      Theater.belongsTo(models.City, {
        foreignKey: 'city_id',
        as: 'city',
      });

      Theater.belongsToMany(models.Movie, {
        through: 'theaters_movies',
        foreignKey: 'theater_id',
        otherKey: 'movie_id',
        as: 'movies',
      });

      Theater.hasMany(models.Movieshow, {
        foreignKey: 'theater_id',
        as: 'movieShows',
      });
    }
  }
  Theater.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      city_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Theater',
      tableName: 'theaters',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    },
  );
  return Theater;
};
