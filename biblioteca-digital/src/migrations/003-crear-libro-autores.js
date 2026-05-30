// src/migrations/003-crear-libro-autores.js
// Tabla intermedia para la relación N:M entre libros y autores.
// El par (libro_id, autor_id) es único e indexado para JOINs eficientes.
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('libro_autores', {
      libro_id: {
        type:       Sequelize.DataTypes.INTEGER,
        allowNull:  false,
        references: { model: 'libros',  key: 'id' },
        onDelete:   'CASCADE',
      },
      autor_id: {
        type:       Sequelize.DataTypes.INTEGER,
        allowNull:  false,
        references: { model: 'autores', key: 'id' },
        onDelete:   'CASCADE',
      },
      createdAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
    });

    // Índice compuesto único — el par debe ser único e indexado (checklist 8.7)
    await queryInterface.addIndex('libro_autores', ['libro_id', 'autor_id'], {
      unique: true,
      name:   'idx_libro_autores_pk',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('libro_autores');
  },
};
