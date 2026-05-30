'use strict';
// Tabla intermedia N:M entre libros y autores
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('libro_autores', {
      libro_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'libros', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      autor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'autores', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    // Índice compuesto único — evita duplicados y acelera JOINs
    await queryInterface.addIndex('libro_autores', ['libro_id', 'autor_id'], {
      unique: true,
      name: 'idx_libro_autores_pk',
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('libro_autores');
  },
};
