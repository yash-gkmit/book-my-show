'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movies', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      summary: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      release_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      casts: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      genre: {
        type: Sequelize.ENUM(
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
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM('U', 'U/A', 'A'),
        allowNull: true,
      },
      poster_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      trailer_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('movies');
  },
};
