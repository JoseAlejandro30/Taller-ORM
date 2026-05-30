'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id:        { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nombre:    { type: Sequelize.STRING(150), allowNull: false },
      email:     { type: Sequelize.STRING(200), allowNull: false, unique: true },
      activo:    { type: Sequelize.BOOLEAN,     allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('usuarios', ['email'],  { unique: true, name: 'idx_usuarios_email' });
    await queryInterface.addIndex('usuarios', ['activo'], { name: 'idx_usuarios_activo' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('usuarios');
  },
};
