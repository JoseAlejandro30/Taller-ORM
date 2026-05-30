'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('autores', {
      id:           { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nombre:       { type: Sequelize.STRING(100), allowNull: false },
      apellido:     { type: Sequelize.STRING(100), allowNull: false },
      nacionalidad: { type: Sequelize.STRING(60),  allowNull: true  },
      createdAt:    { type: Sequelize.DATE, allowNull: false },
      updatedAt:    { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('autores', ['apellido']);
    await queryInterface.addIndex('autores', ['nombre', 'apellido']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('autores');
  },
};
