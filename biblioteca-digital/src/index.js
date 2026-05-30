// src/index.js
// Punto de entrada — muestra el estado del sistema
const { sequelize } = require('./models');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa.');
    console.log('\nUsa los siguientes comandos:\n');
    console.log('  node src/demo.js        → Ejecutar demo completa');
    console.log('  npx sequelize-cli db:migrate      → Aplicar migraciones');
    console.log('  npx sequelize-cli db:migrate:undo → Revertir migraciones');
    await sequelize.close();
  } catch (err) {
    console.error('Error de conexión:', err.message);
    process.exit(1);
  }
}

main();
