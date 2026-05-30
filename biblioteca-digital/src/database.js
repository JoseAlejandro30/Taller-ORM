// src/database.js
// Instancia única de Sequelize (patrón Singleton)
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './biblioteca.sqlite',
  logging: (sql) => {
    // Muestra las queries generadas para inspección (R4 - sin N+1)
    if (process.env.LOG_SQL === 'true') {
      console.log('\x1b[36m[SQL]\x1b[0m', sql);
    }
  },
});

module.exports = sequelize;
