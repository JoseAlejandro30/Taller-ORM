const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define(
    'Usuario',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: { notEmpty: { msg: 'El nombre no puede estar vacío' } },
      },
      email: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: { msg: 'Este email ya está registrado' },
        validate: {
          isEmail: { msg: 'El email no tiene un formato válido' },
        },
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'usuarios',
      timestamps: true,
      indexes: [
        { unique: true, fields: ['email'] },
        { fields: ['activo'] },
      ],
    }
  );

  return Usuario;
};
