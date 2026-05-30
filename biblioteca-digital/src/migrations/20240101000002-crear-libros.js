'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('libros', {
      id:                 { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      titulo:             { type: Sequelize.STRING(200), allowNull: false },
      isbn:               { type: Sequelize.STRING(20),  allowNull: false, unique: true },
      anio_publicacion:   { type: Sequelize.INTEGER,     allowNull: true  },
      copias_disponibles: { type: Sequelize.INTEGER,     allowNull: false, defaultValue: 1 },
      activo:             { type: Sequelize.BOOLEAN,     allowNull: false, defaultValue: true },
      createdAt:          { type: Sequelize.DATE, allowNull: false },
      updatedAt:          { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('libros', ['isbn'],                      { unique: true, name: 'idx_libros_isbn' });
    await queryInterface.addIndex('libros', ['titulo'],                    { name: 'idx_libros_titulo' });
    await queryInterface.addIndex('libros', ['activo', 'copias_disponibles'], { name: 'idx_libros_activo_copias' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('libros');
  },
};
