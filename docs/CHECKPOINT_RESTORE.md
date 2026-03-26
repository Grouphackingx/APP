# 🟢 PUNTO DE RESTAURACIÓN: OPENTICKET (Sistema Completo)

**Fecha de Última Actualización:** 26 de Marzo de 2026, 00:15  
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

2. ✅ **QR Codes Reales** — Componente `QRCode.tsx` con librería `qrcode`:
   - Genera QR codes escaneables a partir de los JWT tokens de cada ticket
   - Efecto glow verde para tickets válidos, escala en grayscale para usados
   - Animación pulse sutil en el label "Presenta este QR en la entrada"
   - Manejo de errores con fallback visual

3. ✅ **Búsqueda de Eventos** — Nuevo componente `SearchBar.tsx` integrado en HomePage:
   - Filtro por título o ubicación (insensible a mayúsculas)
   - Debounce de 500ms para optimizar peticiones
   - Actualización de URL (`?q=...`) y estado vacío personalizado
   - Estilo "Glassmorphism" flotante sobre el contenido

4. ✅ **API Orders enriquecida** — `GET /api/orders` ahora decodifica los QR JWT tokens de cada ticket para extraer y agregar:
   - `eventTitle`, `eventDate`, `eventLocation`, `eventCity`
   - `zoneName`, `seatNumber`
   - (El modelo Ticket no tiene relación directa con Seat, la info se extrae del JWT)

5. ✅ **Mejora en "Mis Tickets"** — Ahora se visualiza la ciudad del evento al lado del lugar (ej. `📍 Lugar, Ciudad`).

6. ✅ **Upload de Imágenes** — Nueva funcionalidad completa para eventos:
   - **Backend**: Endpoint `POST /api/upload` (Multer + DiskStorage)
   - **Static Serving**: Imágenes accesibles en `http://localhost:3000/uploads/`
   - **Frontend (Host)**: `CreateEventForm` actualizado con drag & drop y previsualización
   - **Validación**: Límite de 5MB, solo imágenes (jpg/png)

7. ✅ **Botón "Mis Tickets"** en el Navbar — botón cyan que aparece solo cuando el usuario está autenticado

8. ✅ **Mejoras UI/UX en el Buscador (SearchBar)** — Integración perfecta en el Hero Section del web-client:
   - Se reemplazó el texto descriptivo del hero por el componente `<SearchBar />` dándole más protagonismo.
   - Reubicación estratégica entre el título principal y los botones de acción ("Explorar Eventos" y "Crear Cuenta").
   - Ajustes de márgenes (`2.5rem` superior y `3rem` inferior) en `global.css` para optimizar el espacio (breathing room) y la experiencia de usuario.

9. ✅ **Sistema de Estados de Eventos (Activo, Inactivo, Borrador)**:
   - **Backend**: 
     - Se actualizó el enum `EventStatus` en Prisma a `DRAFT`, `PUBLISHED`, e `INACTIVE`.
     - Lógica automatizada en `events.service.ts` (`updatePastEventsStatus`) que detecta eventos `PUBLISHED` con fechas en el pasado y los cambia a `INACTIVE` automáticamente al ser consultados.
     - Bloqueo de seguridad al intentar crear o modificar eventos asignándoles una fecha pasada (`BadRequestException`).
   - **Frontend (Host)**: 
     - Tabla del Dashboard ahora muestra visualmente los estados ("🔴 Inactivo", "🟢 Activo", "📝 Borrador").
     - Formularios de Creación (`CreateEventForm`) y Edición (`EditEventForm`) actualizados con un menú desplegable al final de la página para definir si el evento nace como "Borrador" o "Activo".
     - Bloqueo en el input de calendario (`datetime-local`) para que no permita elegir días u horas que ya pasaron (basado en la zona horaria local).
   - **Frontend (Web Client)**: 
     - Los eventos que caen en estado `INACTIVE` son excluidos automáticamente del Home y búsquedas.
     - Si se navega directamente a la URL de un evento `INACTIVE`, se muestra un recuadro indicando "Evento Finalizado".

10. ✅ **Edición y Eliminación Condicional de Eventos**:
    - **Backend**: Endpoint PATCH `/events/:id` para editar y DELETE `/events/:id` para borrar. El borrado verifica en BD (`hasSoldSeats`) que **no haya tickets vendidos**; caso contrario lanza error.
    - **Frontend (Host)**: Formularios de Edición acoplados al nuevo endpoint. Botón de papelera en el Dashboard que solo aparece si los "Tickets Vendidos" son 0.

11. ✅ **Pestañas de Estado en Dashboard**:
    - **Frontend (Host)**: Se añadieron 3 pestañas ("Activos", "Inactivos" y "Borrador") separando los eventos visualmente mediante filtros vinculados a `PUBLISHED`, `INACTIVE` y `DRAFT`. Integrado en `DashboardPage.tsx` con UI y animaciones adaptadas.

12. ✅ **Integración Inteligente de Videos de YouTube**:
    - **Frontend (Web Client)**: Función nativa `getVideoEmbedUrl` añadida en `EventDetailClient.tsx` que intercepta cualquier tipo de enlace (youtu.be, URL acortadas o /watch) pegado por el organizador y lo convierte al formato seguro `/embed/`, evitando bloqueos de permisos.

13. ✅ **Corrección Flujo de Estado (Draft/Published)**:
    - **Full-Stack**: Se corrigió un bug donde los nuevos eventos se creaban como borradores por defecto a pesar de que se escogiera "Activo". Se integró `status?: string` en el Validator global (`CreateEventDto`) que permite a NestJS leer y almacenar explícitamente el cambio eludiendo las restricciones de Prisma en `events.service.ts`.

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

- [x] ~~Generar imagen QR real con librería `qrcode` en la página "Mis Tickets"~~ ✅
- [ ] Integración real con Stripe (reemplazar el mock)
- [x] ~~Búsqueda y filtrado de eventos (por fecha, ubicación, categoría)~~ ✅
- [x] ~~Upload de imágenes para eventos (actualmente sin imagen)~~ ✅
- [ ] Panel de Administración (dashboard de ventas, gestión de usuarios)
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
