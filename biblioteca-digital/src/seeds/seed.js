// src/seeds/seed.js
// ──────────────────────────────────────────────────────────────────────────────
// R7: Datos iniciales — 3 autores, 5 libros, 2 usuarios, 2 préstamos
// Este script puede ejecutarse directamente: node src/seeds/seed.js
// ──────────────────────────────────────────────────────────────────────────────
const { sequelize, Autor, Libro, Usuario } = require('../models');
const servicio = require('../services/BibliotecaService');

async function seedDatabase() {
  console.log('\n🌱 Iniciando seed de la base de datos...\n');

  // ─── 3 Autores ───────────────────────────────────────────────────────────────
  const [gabriel, isabel, jorge] = await Promise.all([
    servicio.crearAutor({ nombre: 'Gabriel',  apellido: 'García Márquez', nacionalidad: 'Colombiana' }),
    servicio.crearAutor({ nombre: 'Isabel',   apellido: 'Allende',        nacionalidad: 'Chilena'    }),
    servicio.crearAutor({ nombre: 'Jorge',    apellido: 'Luis Borges',    nacionalidad: 'Argentina'  }),
  ]);
  console.log('✅ 3 autores creados:', [gabriel, isabel, jorge].map(a => `${a.nombre} ${a.apellido}`).join(', '));

  // ─── 5 Libros con sus autores ────────────────────────────────────────────────
  const libro1 = await servicio.registrarLibro({
    titulo:              'Cien Años de Soledad',
    isbn:                '978-0307474728',
    anio_publicacion:    1967,
    copias_disponibles:  3,
    autoresIds:          [gabriel.id],
  });

  const libro2 = await servicio.registrarLibro({
    titulo:              'El Amor en los Tiempos del Cólera',
    isbn:                '978-0307389732',
    anio_publicacion:    1985,
    copias_disponibles:  2,
    autoresIds:          [gabriel.id],
  });

  const libro3 = await servicio.registrarLibro({
    titulo:              'La Casa de los Espíritus',
    isbn:                '978-0525562030',
    anio_publicacion:    1982,
    copias_disponibles:  2,
    autoresIds:          [isabel.id],
  });

  const libro4 = await servicio.registrarLibro({
    titulo:              'El Aleph',
    isbn:                '978-0142437889',
    anio_publicacion:    1949,
    copias_disponibles:  1,
    autoresIds:          [jorge.id],
  });

  // Libro 5: co-autoría ficticia (para demostrar N:M)
  const libro5 = await servicio.registrarLibro({
    titulo:              'Antología del Realismo Mágico',
    isbn:                '978-0000000001',
    anio_publicacion:    2010,
    copias_disponibles:  4,
    autoresIds:          [gabriel.id, isabel.id], // dos autores
  });

  console.log('✅ 5 libros creados:', [libro1, libro2, libro3, libro4, libro5].map(l => l.titulo).join(', '));

  // ─── 2 Usuarios ─────────────────────────────────────────────────────────────
  const [ana, carlos] = await Promise.all([
    servicio.crearUsuario({ nombre: 'Ana Martínez',   email: 'ana.martinez@unicesar.edu.co'   }),
    servicio.crearUsuario({ nombre: 'Carlos Pedraza', email: 'carlos.pedraza@unicesar.edu.co' }),
  ]);
  console.log('✅ 2 usuarios creados:', [ana, carlos].map(u => u.nombre).join(', '));

  // ─── 2 Préstamos ────────────────────────────────────────────────────────────
  const hoy    = new Date();
  const en15   = new Date(hoy); en15.setDate(hoy.getDate() + 15);
  const en10   = new Date(hoy); en10.setDate(hoy.getDate() + 10);

  const p1 = await servicio.registrarPrestamo({
    libroId:                libro1.id,
    usuarioId:              ana.id,
    fechaDevolucionEsperada: en15.toISOString().split('T')[0],
  });

  const p2 = await servicio.registrarPrestamo({
    libroId:                libro4.id,
    usuarioId:              carlos.id,
    fechaDevolucionEsperada: en10.toISOString().split('T')[0],
  });

  console.log('✅ 2 préstamos creados:',
    `[#${p1.id}] ${p1.usuario.nombre} → "${p1.libro.titulo}"`,
    `/ [#${p2.id}] ${p2.usuario.nombre} → "${p2.libro.titulo}"`
  );

  console.log('\n🎉 Seed completado exitosamente.\n');
}

module.exports = { seedDatabase };

// Permite ejecutar directamente: node src/seeds/seed.js
if (require.main === module) {
  seedDatabase().catch(console.error);
}
