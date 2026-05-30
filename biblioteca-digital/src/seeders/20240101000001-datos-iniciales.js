'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('autores', [
      { nombre: 'Gabriel', apellido: 'Garcia Marquez', nacionalidad: 'Colombiano', createdAt: now, updatedAt: now },
      { nombre: 'Isabel',  apellido: 'Allende',        nacionalidad: 'Chilena',    createdAt: now, updatedAt: now },
      { nombre: 'Jorge',   apellido: 'Luis Borges',    nacionalidad: 'Argentino',  createdAt: now, updatedAt: now },
    ]);

    await queryInterface.bulkInsert('libros', [
      { titulo: 'Cien anos de soledad',           isbn: '978-0-06-088328-7',  anio_publicacion: 1967, copias_disponibles: 3, activo: true, createdAt: now, updatedAt: now },
      { titulo: 'El amor en los tiempos del colera', isbn: '978-0-307-38969-5', anio_publicacion: 1985, copias_disponibles: 2, activo: true, createdAt: now, updatedAt: now },
      { titulo: 'La casa de los espiritus',       isbn: '978-0-553-27391-4',  anio_publicacion: 1982, copias_disponibles: 4, activo: true, createdAt: now, updatedAt: now },
      { titulo: 'Ficciones',                      isbn: '978-0-802-19076-8',  anio_publicacion: 1944, copias_disponibles: 2, activo: true, createdAt: now, updatedAt: now },
      { titulo: 'El Aleph',                       isbn: '978-0-140-28680-7',  anio_publicacion: 1949, copias_disponibles: 1, activo: true, createdAt: now, updatedAt: now },
    ]);

    await queryInterface.bulkInsert('libro_autores', [
      { libro_id: 1, autor_id: 1, createdAt: now, updatedAt: now },
      { libro_id: 2, autor_id: 1, createdAt: now, updatedAt: now },
      { libro_id: 3, autor_id: 2, createdAt: now, updatedAt: now },
      { libro_id: 4, autor_id: 3, createdAt: now, updatedAt: now },
      { libro_id: 5, autor_id: 3, createdAt: now, updatedAt: now },
    ]);

    await queryInterface.bulkInsert('usuarios', [
      { nombre: 'Maria Camila Torres', email: 'mcamila@unicesar.edu.co', activo: true, createdAt: now, updatedAt: now },
      { nombre: 'Andres Felipe Perez', email: 'afperez@unicesar.edu.co', activo: true, createdAt: now, updatedAt: now },
    ]);

    const hoy = new Date().toISOString().split('T')[0];
    const en15 = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const en7  = new Date(Date.now() +  7 * 86400000).toISOString().split('T')[0];

    await queryInterface.bulkInsert('prestamos', [
      { libro_id: 1, usuario_id: 1, fecha_prestamo: hoy, fecha_devolucion_esperada: en15, fecha_devolucion_real: null, createdAt: now, updatedAt: now },
      { libro_id: 4, usuario_id: 2, fecha_prestamo: hoy, fecha_devolucion_esperada: en7,  fecha_devolucion_real: null, createdAt: now, updatedAt: now },
    ]);

    const ts = now.toISOString();
    await queryInterface.sequelize.query(
      "UPDATE libros SET copias_disponibles = copias_disponibles - 1, updatedAt = '" + ts + "' WHERE id IN (1, 4)"
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('prestamos',     null, {});
    await queryInterface.bulkDelete('libro_autores', null, {});
    await queryInterface.bulkDelete('usuarios',      null, {});
    await queryInterface.bulkDelete('libros',        null, {});
    await queryInterface.bulkDelete('autores',       null, {});
  },
};
