const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize({
  dialect: dbConfig.dialect,
  storage: dbConfig.storage,
  logging: dbConfig.logging,
  pool: dbConfig.pool,
});

// ─── Importar modelos ───────────────────────────────────────
const Autor   = require('./Autor')(sequelize);
const Libro   = require('./Libro')(sequelize);
const Usuario = require('./Usuario')(sequelize);
const Prestamo = require('./Prestamo')(sequelize);

// ─── Definir Relaciones ─────────────────────────────────────

// N:M  Libro <-> Autor (tabla intermedia: libro_autores)
Libro.belongsToMany(Autor, {
  through: 'libro_autores',
  foreignKey: 'libro_id',
  otherKey: 'autor_id',
  as: 'autores',
});
Autor.belongsToMany(Libro, {
  through: 'libro_autores',
  foreignKey: 'autor_id',
  otherKey: 'libro_id',
  as: 'libros',
});

// N:1  Prestamo -> Libro
Prestamo.belongsTo(Libro, { foreignKey: 'libro_id', as: 'libro' });
Libro.hasMany(Prestamo,   { foreignKey: 'libro_id', as: 'prestamos' });

// N:1  Prestamo -> Usuario
Prestamo.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasMany(Prestamo,   { foreignKey: 'usuario_id', as: 'prestamos' });

module.exports = { sequelize, Sequelize, Autor, Libro, Usuario, Prestamo };
