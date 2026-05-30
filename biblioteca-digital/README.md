# Sistema de Biblioteca Digital — Ejercicio Final ORM

Ejercicio final del Curso de ORM · Ingeniería de Software · Universidad Popular del Cesar  
**Framework:** Node.js + Sequelize ORM + SQLite

---

## Estructura del proyecto

```
biblioteca-digital/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de la BD por entorno
│   ├── models/
│   │   ├── index.js             # Instancia Sequelize + relaciones
│   │   ├── Autor.js             # Entidad Autor
│   │   ├── Libro.js             # Entidad Libro
│   │   ├── Usuario.js           # Entidad Usuario
│   │   └── Prestamo.js          # Entidad Prestamo
│   ├── migrations/
│   │   ├── ...-crear-autores.js
│   │   ├── ...-crear-libros.js
│   │   ├── ...-crear-usuarios.js
│   │   ├── ...-crear-libro-autores.js   # Tabla intermedia N:M
│   │   └── ...-crear-prestamos.js
│   ├── seeders/
│   │   └── ...-datos-iniciales.js       # 3 autores, 5 libros, 2 usuarios, 2 préstamos
│   ├── repositories/
│   │   ├── LibroRepository.js
│   │   └── PrestamoRepository.js
│   ├── services/
│   │   └── BibliotecaService.js         # Las 5 operaciones del R4
│   └── demo-sqljsdemo.js               # Demo ejecutable sin instalación nativa
├── database/                            # SQLite file (generado)
├── .sequelizerc
└── README.md
```

---

## Requerimientos implementados

| # | Requerimiento | Estado |
|---|---------------|--------|
| R1 | Modelado ORM — entidades con tipos, restricciones y PKs | ✅ |
| R2 | Relaciones N:M Libro↔Autor, N:1 Prestamo→Libro/Usuario | ✅ |
| R3 | Migraciones versionadas con rollback | ✅ |
| R4 | 5 operaciones CRUD en BibliotecaService | ✅ |
| R5 | Transacciones en préstamo y devolución | ✅ |
| R6 | Validaciones: copias≥0, ISBN único, sin copias=sin préstamo | ✅ |
| R7 | Seed con 3 autores, 5 libros, 2 usuarios, 2 préstamos | ✅ |

---

## Cómo ejecutar

### 1. Instalar dependencias
```bash
npm install
```

### 2. Demo rápida (sin instalación nativa de SQLite)
```bash
node src/demo-sqljsdemo.js
```

### 3. Con Sequelize CLI (requiere sqlite3 nativo)
```bash
# Aplicar migraciones
npm run migrate

# Insertar datos de prueba
npm run seed

# Revertir todo y empezar de cero
npm run db:reset
```

---

## Decisiones de diseño

### Relaciones
- **N:M Libro↔Autor** mediante tabla intermedia `libro_autores` con índice compuesto único.
- **Soft delete no aplicado a Libros** — se usa el campo `activo` en su lugar.
- **RESTRICT en FK de préstamos** — no se puede borrar un libro o usuario con préstamos activos.

### Carga de datos (sin N+1)
- R4-2 usa `include: [{ model: Autor }]` con Sequelize → genera un solo JOIN.
- En SQL puro: un solo `SELECT ... JOIN libro_autores JOIN autores`.

### Transacciones (R5)
- `registrarPrestamo`: BEGIN → validar copias → insertar préstamo → decrementar copias → COMMIT. Rollback automático si cualquier paso falla.
- `registrarDevolucion`: BEGIN → verificar estado → actualizar fecha → incrementar copias → COMMIT.

### Índices
- `isbn` UNIQUE en libros.
- `email` UNIQUE en usuarios.
- `(libro_id, autor_id)` UNIQUE en libro_autores.
- `fecha_devolucion_real` en préstamos (para consultas de activos eficientes).
