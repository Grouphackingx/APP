# 🟢 PUNTO DE RESTAURACIÓN: OPENTICKET (Sistema Completo)

**Fecha de Última Actualización:** 12 de Febrero de 2026, 22:52  
**Estado del Proyecto:** ✅ COMPLETO Y VERIFICADO (Fases 1, 2 y 3 Funcionando)

Este archivo contiene toda la información necesaria para retomar el proyecto y continuar con las pruebas en cualquier momento.

---

## 1. 🚀 Cómo Retomar el Proyecto

Para volver a levantar todo el sistema después de reiniciar tu PC o VS Code:

### Paso 1: Base de Datos (Docker)

Asegúrate de que Docker Desktop esté corriendo.

```bash
docker-compose up -d
```

> Verifica que los contenedores estén activos: `docker ps` (deberías ver `openticket-postgres` y `openticket-redis`)

### Paso 2: Generar Prisma Client (solo si es la primera vez o cambiaste el schema)

```bash
npx prisma generate --schema=libs/shared/prisma/schema.prisma
npx prisma db push --schema=libs/shared/prisma/schema.prisma
```

### Paso 3: Seed de Roles (solo primera vez con BD vacía)

Si la BD está vacía, primero registra los usuarios con el API corriendo, luego ejecuta:

```bash
node scripts/seed-roles.js
```

### Paso 4: Iniciar Servidores

Abre **3 terminales** en VS Code (`Ctrl+Shift+ñ`) y ejecuta:

**Terminal 1: Backend (API)**

```bash
npx nx serve api --no-dte
```

_(Espera a que diga "Application is running on: http://localhost:3000/api")_

**Terminal 2: Web Client (Usuarios)**

```bash
npx nx dev web-client --no-dte
```

_(Accesible en http://localhost:4200)_

**Terminal 3: Web Host (Organizadores)**

```bash
cd apps/web-host
npx next dev --port=4201
```

_(Accesible en http://localhost:4201)_

> **⚠️ Nota**: No uses `npx nx dev web-host` ya que la TUI interactiva de Nx puede dar problemas. Usa `npx next dev --port=4201` directamente.

### Paso 5: Iniciar App Móvil (Staff — Opcional)

```bash
cd apps/mobile-app
npx expo start
```

_(Usa la App "Expo Go" en tu celular para escanear el QR de la terminal)_

---

## 2. 🧪 Datos de Prueba (Credenciales)

Puedes usar estos usuarios pre-creados o registrar nuevos:

| Rol                    | Email                    | Password     | Dónde usarlo                           |
| :--------------------- | :----------------------- | :----------- | :------------------------------------- |
| **Organizador (Host)** | `admin@openticket.com`   | `admin123`   | http://localhost:4201 (Panel Host)     |
| **Cliente (User)**     | `cliente@openticket.com` | `cliente123` | http://localhost:4200 (Portal Cliente) |
| **Staff (Validator)**  | `staff@openticket.com`   | `staff123`   | Mobile App (Expo Go)                   |

---

## 3. 📦 Estado de la Implementación (Verificado ✅)

### Backend (NestJS) ✅ — 7 módulos

- **Auth**: Login JWT y Registro con bcrypt.
- **Eventos**: CRUD completo, soporte de zonas y asientos auto-generados.
- **Órdenes**: Bloqueo de asientos con Redis (10 min TTL), transacciones atómicas en Postgres, compra y generación de QR JWT.
- **Pagos**: Módulo `/payments` simulando Stripe (siempre aprueba). `// TODO: Implementar pagos con Stripe`.
- **Validación**: Endpoint `/tickets/validate` para APP Móvil (VALID → USED, previene doble uso).
- **Prisma**: PrismaService como singleton inyectable.
- **Redis**: RedisService con ioredis (lock/unlock/getSeatLockHolder).

### API Endpoints Verificados

| Método | Endpoint                   | Auth        | Estado | Descripción                             |
| :----- | :------------------------- | :---------- | :----- | :-------------------------------------- |
| GET    | `/api`                     | No          | ✅ OK  | Health check                            |
| POST   | `/api/auth/register`       | No          | ✅ OK  | Registro de usuario                     |
| POST   | `/api/auth/login`          | No          | ✅ OK  | Login JWT (retorna access_token + user) |
| GET    | `/api/events`              | No          | ✅ OK  | Listar eventos con zonas                |
| GET    | `/api/events/:id`          | No          | ✅ OK  | Detalle de evento con zonas y asientos  |
| POST   | `/api/events`              | JWT (HOST)  | ✅ OK  | Crear evento con zonas y asientos       |
| POST   | `/api/orders/lock-seats`   | JWT         | ✅ OK  | Bloquear asientos (Redis 10 min)        |
| POST   | `/api/orders/unlock-seats` | JWT         | ✅ OK  | Liberar asientos bloqueados             |
| POST   | `/api/orders/purchase`     | JWT         | ✅ OK  | Comprar tickets (genera QR JWT)         |
| GET    | `/api/orders`              | JWT         | ✅ OK  | Mis órdenes con tickets enriquecidos    |
| POST   | `/api/tickets/validate`    | JWT (STAFF) | ✅ OK  | Validar ticket QR (VALID → USED)        |

### Frontend Web Client (Next.js) ✅ — 5 páginas

| Ruta           | Estado       | Descripción                                                |
| :------------- | :----------- | :--------------------------------------------------------- |
| `/`            | ✅           | Hero animado + catálogo de eventos en grid                 |
| `/login`       | ✅           | Formulario de login con JWT y localStorage                 |
| `/register`    | ✅           | Formulario de registro                                     |
| `/events/[id]` | ✅           | Detalle del evento + mapa de asientos interactivo + compra |
| `/my-tickets`  | ✅ **NUEVO** | Mis órdenes con tickets, zona, asiento, estado y QR        |

**Características UI:**

- 🎨 Tema oscuro premium con glassmorphism, gradientes y animaciones CSS
- 🔤 Tipografía: Inter + Space Grotesk (Google Fonts)
- 🪑 Mapa de asientos interactivo (verde=disponible, morado=seleccionado, gris=vendido)
- 🎫 Navbar con botón "Mis Tickets" (solo cuando está logueado)
- 📊 Página "Mis Tickets" con stats, órdenes expandibles, tarjetas estilo ticket con tear-line

### Frontend Web Host (Next.js) ✅

- **Login**: Autenticación exclusiva para organizadores.
- **Dashboard**: Stats (eventos, tickets vendidos, ingresos) + tabla de eventos.
- **Crear Evento**: Formulario con zonas dinámicas (nombre, precio, capacidad).

### Mobile App (React Native / Expo) ✅

- **Login**: Autenticación para Staff.
- **Scanner**: Uso de cámara para leer QRs.
- **Validación**: Feedback visual al validar tickets contra el backend.

---

## 4. 📋 Cambios Recientes (Última Sesión)

### Nuevas funcionalidades:

1. ✅ **Página "Mis Tickets"** (`/my-tickets`) en el web-client — muestra todas las órdenes y tickets comprados con:
   - Resumen con stats (órdenes, tickets totales, válidos, usados)
   - Órdenes expandibles mostrando nombre del evento, fecha, ubicación, monto
   - Tarjetas de ticket individual con zona, asiento, estado, sección QR, y link "Ver Evento"
   - Diseño responsive con tear-line effect en los tickets

2. ✅ **API Orders enriquecida** — `GET /api/orders` ahora decodifica los QR JWT tokens de cada ticket para extraer y agregar:
   - `eventTitle`, `eventDate`, `eventLocation`
   - `zoneName`, `seatNumber`
   - (El modelo Ticket no tiene relación directa con Seat, la info se extrae del JWT)

3. ✅ **Botón "Mis Tickets"** en el Navbar — botón cyan que aparece solo cuando el usuario está autenticado

### Correcciones previas:

- 🔧 Bug en `orders.service.ts`: eliminado `if` anidado redundante en verificación de lock
- 🔧 Roles de usuario: script `seed-roles.js` para asignar HOST y STAFF
- 🔧 Documentación completa en `/docs`

---

## 5. 📝 Notas Técnicas para el Desarrollador

- **Persistencia**: Los datos (usuarios, eventos, tickets) se guardan en el volumen Docker `openticket_postgres_data`. No se pierden al reiniciar contenedores.
- **Pagos Mock**: El sistema de pagos es una simulación (`PaymentsModule`). Para producción: configurar `STRIPE_SECRET_KEY` en `.env` e implementar la integración real.
- **API URL en Móvil**: La app móvil detecta automáticamente tu IP local si usas Expo Go. Si falla: revisa `apps/mobile-app/src/app/services/api.ts`.
- **Puertos no estándar**: PostgreSQL en **5435**, Redis en **6380** (para evitar conflictos con servicios locales).
- **Prisma**: Versión **5.22.0** (bloqueada — v7+ tiene incompatibilidades de CLI).
- **Web Host**: Usar `npx next dev --port=4201` desde `apps/web-host/`, no el comando Nx.
- **Ticket sin relación a Seat**: El modelo `Ticket` no tiene `seatId`. La info del asiento está codificada en el QR JWT y se decodifica en runtime.
- **Lint warning**: `any` type en `orders.service.ts` línea 191 (cast de enum `TicketStatus`) — funcional, mejora cosmética pendiente.

---

## 6. 🗺️ Próximos Pasos de Desarrollo

### Prioridad Alta

- [ ] Generar imagen QR real con librería `qrcode` en la página "Mis Tickets"
- [ ] Integración real con Stripe (reemplazar el mock)
- [ ] Búsqueda y filtrado de eventos (por fecha, ubicación, categoría)
- [ ] Upload de imágenes para eventos (actualmente sin imagen)

### Prioridad Media

- [ ] Panel de Admin (gestión global de usuarios y eventos)
- [ ] Emails transaccionales (confirmación de compra)
- [ ] Reportes financieros para organizadores
- [ ] Paginación en endpoints (eventos, órdenes)

### Prioridad Baja

- [ ] Websockets para actualización en tiempo real del mapa de asientos
- [ ] Rate limiting en API
- [ ] CI/CD pipeline
- [ ] Tests unitarios e integración
- [ ] CDN para imágenes
- [ ] Sistema de categorías de eventos
