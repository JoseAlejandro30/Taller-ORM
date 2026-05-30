const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Libro = sequelize.define(
    'Libro',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      titulo: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: { msg: 'El título no puede estar vacío' } },
      },
      isbn: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: { msg: 'El ISBN ya existe en el sistema' },
        validate: { notEmpty: { msg: 'El ISBN no puede estar vacío' } },
      },
      anio_publicacion: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: { args: 1450, msg: 'Año de publicación inválido' },
          max: { args: new Date().getFullYear(), msg: 'El año no puede ser futuro' },
        },
      },
      copias_disponibles: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: { args: 0, msg: 'Las copias disponibles no pueden ser negativas' },
        },
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'libros',
      timestamps: true,
      indexes: [
        { unique: true, fields: ['isbn'] },
        { fields: ['titulo'] },
        { fields: ['activo', 'copias_disponibles'] },
      ],
    }
  );

  return Libro;
};
