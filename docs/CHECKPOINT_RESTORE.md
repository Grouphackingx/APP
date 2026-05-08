# 🟢 PUNTO DE RESTAURACIÓN: OPENTICKET (Sistema Completo)

**Fecha de Última Actualización:** 8 de Mayo de 2026
**Estado del Proyecto:** ✅ COMPLETO Y VERIFICADO (Fases 1-4 + Portal Cliente: Mi Perfil + Toast de login + Tickets usados en rojo + Panel Host: Asistentes + Escáner de tickets con cámara QR y búsqueda por ID)

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

> ⚠️ **IMPORTANTE**: El NX Daemon NO funciona correctamente en este proyecto. La API NO se recompila automáticamente cuando haces cambios. Debes usar el siguiente flujo:

```bash
# Opción A: Build manual + Run directo (RECOMENDADO)
npx nx build api
node dist/apps/api/main.js

# Opción B: Si quieres try nx serve (puede no recompilar cambios automáticamente)
npx nx serve api
```

> **Si cambias código del backend**, debes Ctrl+C, re-build y re-run:
> ```bash
> npx nx build api
> node dist/apps/api/main.js
> ```

_(Espera a que diga "Application is running on: http://localhost:3000/api")_

**Terminal 2: Web Client (Usuarios)**

```bash
cd apps/web-client
npx next dev --port=4200
```

_(Accesible en http://localhost:4200)_

**Terminal 3: Web Host (Organizadores)**

```bash
cd apps/web-host
npx next dev --port=4201
```

_(Accesible en http://localhost:4201)_

**Terminal 4: Web Admin (Administrador Global)**

```bash
cd apps/web-admin
npx next dev --port=4202
```

_(Accesible en http://localhost:4202)_

> **⚠️ Nota**: No uses `npx nx dev ...` ya que la TUI interactiva de Nx puede dar problemas. Usa `npx next dev --port=XXXX` directamente.

### Paso 5: Iniciar App Móvil (Staff — Opcional)

```bash
cd apps/mobile-app
npx expo start
```

_(Usa la App "Expo Go" en tu celular para escanear el QR de la terminal)_

---

## 2. 🧪 Datos de Prueba (Credenciales)

Puedes usar estos usuarios pre-creados o registrar nuevos (Asegurate de correr `create-admin.ts` para el super usuario):

| Rol                    | Email                      | Password       | Dónde usarlo                           |
| :--------------------- | :------------------------- | :------------- | :------------------------------------- |
| Administrador Global   | `admin@admin.com`          | `admin123`     | `http://localhost:4202` (web-admin)    |
| **Organizador (Host)** | `admin@openticket.com`     | _(desconocida — restablecer si es necesario)_  | `http://localhost:4201` (Panel Host) |
| **Organizador (Host)** | `grouphackingx@gmail.com`  | _(desconocida — restablecer si es necesario)_  | `http://localhost:4201` (Panel Host) |
| **Cliente (User)**     | `dmxwilly@gmail.com`       | `willy2024`    | `http://localhost:4200` (Portal Cliente) |
| **Cliente (User)**     | `cliente@openticket.com`   | `cliente123`   | `http://localhost:4200` (Portal Cliente) |
| **Staff (Validator)**  | `staff@openticket.com`     | `staff123`     | Mobile App (Expo Go)                   |

> ⚠️ **NOTA**: Los tokens JWT duran **24 horas** (aumentado para desarrollo). Si la API devuelve 401 cerrar sesión y volver a entrar.

---

## 3. ✅ Funcionalidades Verificadas

### Backend (API - Puerto 3000)

| Método | Endpoint                        | Auth        | Estado | Descripción                             |
| :----- | :------------------------------ | :---------- | :----- | :-------------------------------------- |
| POST   | `/api/auth/login`               | No          | ✅ OK  | Login JWT (retorna access_token + user) |
| POST   | `/api/auth/register`            | No          | ✅ OK  | Registro de usuarios                    |
| GET    | `/api/events`                   | No          | ✅ OK  | Listar eventos con zonas y asientos     |
| GET    | `/api/events/:id`               | No          | ✅ OK  | Detalle de evento con zonas y asientos  |
| POST   | `/api/events`                   | JWT (HOST)  | ✅ OK  | Crear evento con zonas y asientos       |
| PATCH  | `/api/events/:id`               | JWT (HOST)  | ✅ OK  | Editar evento, zonas, descripciones     |
| DELETE | `/api/events/:id`               | JWT (HOST)  | ✅ OK  | Borrar evento (solo si 0 vendidos)      |
| POST   | `/api/orders/lock-seats`        | JWT         | ✅ OK  | Bloquear asientos (Redis 10 min)        |
| POST   | `/api/orders/unlock-seats`      | JWT         | ✅ OK  | Liberar asientos bloqueados             |
| POST   | `/api/orders/purchase`          | JWT         | ✅ OK  | Comprar tickets (genera QR JWT)         |
| GET    | `/api/orders`                   | JWT         | ✅ OK  | Obtener órdenes enriquecidos            |
| POST   | `/api/tickets/validate`         | JWT         | ✅ OK  | Validar ticket QR (VALID → USED)        |
| POST   | `/api/tickets/validate-by-id`   | JWT         | ✅ OK  | Validar ticket por ID corto (startsWith)|
| GET    | `/api/orders/attendees/me`      | JWT (HOST)  | ✅ OK  | Lista de asistentes de eventos del organizador (decodifica JWT de tickets) |
| GET    | `/api/auth/me`                  | JWT (USER)  | ✅ OK  | Obtener perfil completo del usuario autenticado |
| PATCH  | `/api/auth/me`                  | JWT (USER)  | ✅ OK  | Actualizar perfil (nombre, email, password, ID, dirección, foto, etc.) |
| POST   | `/api/upload`                   | Opcional    | ✅ OK  | Subir imágenes — tipos: `logo`, `event`, `user-avatar`. Directorios: `uploads/organizers/{id}/...` y `uploads/users/{id}/avatar/` |
| GET    | `/api/plans`                    | No          | ✅ OK  | Planes públicos (para formulario de registro) |
| GET    | `/api/admin/plans`              | JWT (ADMIN) | ✅ OK  | CRUD Planes - Listar |
| POST   | `/api/admin/plans`              | JWT (ADMIN) | ✅ OK  | CRUD Planes - Crear |
| PATCH  | `/api/admin/plans/:id`          | JWT (ADMIN) | ✅ OK  | CRUD Planes - Editar |
| DELETE | `/api/admin/plans/:id`          | JWT (ADMIN) | ✅ OK  | CRUD Planes - Eliminar |
| GET    | `/api/admin/users`              | JWT (ADMIN) | ✅ OK  | CRUD Usuarios Admin - Listar |
| POST   | `/api/admin/users`              | JWT (ADMIN) | ✅ OK  | CRUD Usuarios Admin - Crear |
| PATCH  | `/api/admin/users/:id`          | JWT (ADMIN) | ✅ OK  | CRUD Usuarios Admin - Editar |
| DELETE | `/api/admin/users/:id`          | JWT (ADMIN) | ✅ OK  | CRUD Usuarios Admin - Eliminar |

### Web Client (Puerto 4200)

| Ruta           | Estado | Descripción                                                |
| :------------- | :----- | :--------------------------------------------------------- |
| `/`            | ✅     | Home: Hero + catálogo de eventos en grid + buscador        |
| `/login`       | ✅     | Formulario de login con JWT y localStorage                 |
| `/register`    | ✅     | Formulario de registro                                     |
| `/events/[id]` | ✅     | Detalle del evento + mapa de asientos interactivo + compra |
| `/my-tickets`  | ✅     | Lista de tickets comprados con QR y estado                 |
| `/my-profile`  | ✅     | Perfil del usuario: foto de avatar, datos de acceso, identificación, dirección (provincia/ciudad Ecuador) |

### Web Host (Puerto 4201)

| Sección              | Estado | Descripción                                                         |
| :------------------- | :----- | :------------------------------------------------------------------ |
| Login                | ✅     | Login para organizadores                                            |
| Dashboard            | ✅     | Stats + tabla de eventos con pestañas (Activos/Inactivos/Borrador)  |
| Crear Evento         | ✅     | Formulario completo con zonas, galería, mapa, video                 |
| Editar Evento        | ✅     | Edición de zonas con protección de ventas activas                   |
| Eliminar Evento      | ✅     | Solo visible si 0 tickets vendidos                                  |
| Eliminar Zona        | ✅     | Botón oculto si la zona tiene tickets vendidos (`hasSold`)          |
| Asistentes           | ✅     | Lista de compradores por evento con tickets comprados/usados y estado de asistencia. Filtro por evento + búsqueda por nombre/email + filas expandibles |
| Escáner de Tickets   | ✅     | 3 tabs: Cámara QR (con botones Escanear/Detener), Buscar por ID corto (`#c288f2ae`), Token JWT manual. Validación en tiempo real contra API. |

### Web Admin - Global (Puerto 4202)

| Sección              | Estado | Descripción                                                        |
| :------------------- | :----- | :----------------------------------------------------------------- |
| Login                | ✅     | Login para administrador global                                    |
| Panel Inicio         | ✅     | Resumen del sistema con stats de organizaciones                    |
| Gestión Organizadores| ✅     | Tabla + avatar/logo, acciones: Aprobar, Editar, Eliminar           |
| Modal Edición Org    | ✅     | Edición: email, org, representante, ubicación, plan, estado, **contraseña** y **logo** |
| Gestión de Planes    | ✅     | CRUD completo de planes (nombre, precio, límite de eventos)        |
| Gestión de Usuarios  | ✅     | CRUD Admin/Editor; Editores sin acceso a Planes ni Usuarios        |
| Analíticas           | ✅     | Métricas de eventos, tickets y revenue por organizador             |

### Web Client (Puerto 4200) — Actualizaciones (8 Mayo 2026)

| Sección              | Estado | Descripción                                                        |
| :------------------- | :----- | :----------------------------------------------------------------- |
| Mis Tickets — Usados | ✅     | Tickets escaneados (USED) se muestran en rojo: badge "🔒 Usado", borde de tarjeta, franja "Escaneado: fecha", y texto "Ticket ya utilizado" bajo el QR |

### Web Client (Puerto 4200) — Actualizaciones (3 Mayo 2026)

| Sección              | Estado | Descripción                                                        |
| :------------------- | :----- | :----------------------------------------------------------------- |
| Navbar               | ✅     | Botón `👤 Mi Perfil` entre "Mis Tickets" y "Salir" (solo logueados) |
| Mi Perfil - Header   | ✅     | Avatar circular 80px. Botón ✏️ para cambiar foto. Preview instantáneo al seleccionar. |
| Mi Perfil - Acceso   | ✅     | Edición de nombre, email, teléfono, contraseña (con toggle visibilidad) |
| Mi Perfil - ID       | ✅     | Tipo documento (Cédula/RUC/Pasaporte), número, fecha nacimiento, ciudadanía |
| Mi Perfil - Dirección| ✅     | Provincia (24 provincias Ecuador), ciudad dependiente de provincia, dirección |
| Foto de perfil       | ✅     | Upload a `uploads/users/{userId}/avatar/`. Directorio independiente de organizadores. |
| Toast no-autenticado | ✅     | Al pulsar asiento/entrada sin login → toast 🔒 amarillo con link al login. Auto-cierre 4s. |

### Web Host (Puerto 4201) — Actualizaciones (2 Mayo 2026)

| Sección              | Estado | Descripción                                                        |
| :------------------- | :----- | :----------------------------------------------------------------- |
| Registro - Paso 2    | ✅     | Nuevo campo Logo de Organización con preview circular y botón subir|
| Registro - Paso 3    | ✅     | Planes cargados dinámicamente desde la BD (no hardcoded)           |
| Cuenta en Revisión   | ✅     | Pantalla con botón "Cerrar Sesión y Volver" para cuenta PENDING    |
| Login bloqueado      | ✅     | Cuentas PENDING/REJECTED reciben mensaje de error descriptivo       |

---

## 4. 🔧 Cambios Realizados en Esta Sesión (30-31 Marzo 2026)

### Problema Principal Resuelto: Edición de Zonas en Eventos

**Síntoma**: Al editar un evento desde el dashboard del Host, los campos "Descripción" y "Capacidad" de las zonas no se guardaban. Los cambios se perdían al recargar.

**Causa Raíz Encontrada**: Tres problemas interconectados:

#### 4.1. NX Daemon No Recompilaba la API Automáticamente

**Archivo afectado**: Flujo de desarrollo
**Problema**: El mensaje `NX Daemon is not running. Node process will not restart automatically after file changes` aparecía al correr `npx nx serve api`. Esto significaba que TODOS los cambios al código del backend que se hicieron en sesiones anteriores **nunca se aplicaron** porque el servidor seguía ejecutando el código viejo compilado.
**Solución**: Documentado el flujo correcto: `npx nx build api` → `node dist/apps/api/main.js`. Se debe reiniciar manualmente tras cada cambio en el backend.

#### 4.2. `basicData` No Estaba Sanitizado Para Prisma

**Archivo**: `apps/api/src/app/events/events.service.ts` (método `update`)
**Problema**: El `basicData` (datos del evento sin zonas) se pasaba directamente a `prisma.event.update()`. Si contenía campos desconocidos o tipos incorrectos (ej: `date` como string en vez de `Date`), la transacción Prisma podía fallar silenciosamente y revertir los cambios de zonas.
**Solución**: Se implementó un filtro explícito de campos permitidos (`allowedEventFields`) y conversión de `date` string → `Date` object antes de pasarlo a Prisma.

#### 4.3. Método `update` Reescrito Completamente

**Archivo**: `apps/api/src/app/events/events.service.ts`
**Cambios clave**:
- **Filtrado de campos**: Solo pasa a Prisma los campos que existen en el modelo `Event`
- **Conversión de fecha**: `date` string → `Date` object
- **Protección de capacidad**: No permite reducir la capacidad por debajo del número de entradas vendidas. Lanza error `400 Bad Request` con mensaje descriptivo.
- **Gestión de asientos al cambiar capacidad**:
  - Si la capacidad **aumenta**: Crea nuevos asientos automáticamente (numerados secuencialmente)
  - Si la capacidad **disminuye**: Elimina solo asientos **no vendidos** (de mayor a menor número)
- **Respuesta mejorada**: El PATCH ahora retorna el evento completo con zonas y asientos incluidos
- **Eliminación de debug**: Removido el `import('fs')` de debug

#### 4.4. `findAll` Actualizado Para Incluir Asientos

**Archivo**: `apps/api/src/app/events/events.service.ts` (método `findAll`)
**Cambio**: `include: { zones: true }` → `include: { zones: { include: { seats: true } } }`
**Motivo**: El dashboard del Host necesita saber qué zonas tienen boletos vendidos para bloquear correctamente los campos nombre/precio en el formulario de edición.

#### 4.5. EditEventForm Mejorado

**Archivo**: `apps/web-host/src/components/EditEventForm.tsx`
**Cambios**:
- **soldCount en ZoneInput**: Cada zona ahora calcula y almacena el número exacto de asientos vendidos
- **Protección visual**:
  - Campos `Nombre` y `Precio`: Deshabilitados (gris) si la zona tiene ventas activas. Muestra "Bloqueado (ventas activas)" en rojo.
  - Campo `Descripción`: Siempre editable (incluso con ventas activas)
  - Campo `Capacidad`: Siempre editable pero con `min` dinámico basado en asientos vendidos. Muestra "Mínimo: X (vendidos)" en amarillo.
- **Validación pre-submit**: Antes de enviar al backend, verifica que ninguna zona tenga capacidad menor al número de vendidos
- **Tipos flexibles**: `price` y `capacity` usan `number | string` en el estado de React para permitir edición fluida (sin que al borrar un número se fuerze a 0). Se convierten a `Number()` solo al momento del submit.

#### 4.6. Controlador Simplificado

**Archivo**: `apps/api/src/app/events/events.controller.ts`
**Cambio**: El endpoint PATCH usa `@Request() req` y lee `req.body` directamente, evitando que el `ValidationPipe` global (`whitelist: true`) filtre campos de zona del payload.

#### 4.7. DTOs Actualizados

**Archivo**: `libs/shared/src/lib/dto/events.dto.ts`
**Cambios**:
- `CreateZoneDto`: Agregado campo opcional `id?: string` (necesario para identificar zonas existentes en updates)
- `CreateEventDto`: Campo `zones` ahora es `@IsOptional()` (para permitir PATCH sin zonas)
- Nuevo `UpdateEventDto`: Extiende `PartialType(CreateEventDto)` para validación más flexible

### Validación de Fecha Removida en Update

**Archivo**: `apps/api/src/app/events/events.service.ts`
**Cambio**: Se removió la validación `if (date < now) throw 'fecha en el pasado'` del método `update`.
**Motivo**: Bloqueaba la edición de metadatos (descripciones, capacidades) en eventos activos/pasados. La validación de fecha futura se mantiene solo en `create`.

---

## 5. 📁 Archivos Modificados Esta Sesión (Mayo 2026)

### Sesión del 8 de Mayo 2026 — Asistentes y Escáner (Host) + Tickets Usados en Rojo (Client)

| Archivo | Tipo de Cambio | Descripción |
| :--- | :--- | :--- |
| `apps/api/src/app/orders/orders.service.ts` | Modificado | Nuevo método `getMyEventAttendees(organizerId)`: obtiene todos los tickets del organizador decodificando JWTs, agrupa por usuario+evento, retorna ticketsBought/ticketsUsed |
| `apps/api/src/app/orders/orders.controller.ts` | Modificado | Nuevo endpoint `GET /orders/attendees/me` protegido con JwtAuthGuard |
| `apps/api/src/app/tickets/tickets.service.ts` | Modificado | Nuevo método `validateByTicketId(partialId, staffId)`: busca ticket por `id startsWith` y valida su QR |
| `apps/api/src/app/tickets/tickets.controller.ts` | Modificado | Nuevo endpoint `POST /tickets/validate-by-id` |
| `apps/web-host/src/lib/api.ts` | Modificado | Nuevas funciones: `getAttendees(token)`, `validateTicket(qrToken, authToken)`, `validateTicketById(ticketId, authToken)` |
| `apps/web-host/src/components/Sidebar.tsx` | Modificado | Nuevas entradas en el menú: "👥 Asistentes" y "📷 Escáner de Tickets" |
| `apps/web-host/src/components/AttendeesList.tsx` | **Nuevo** | Vista de asistentes: stats (compradores/entradas/asistencias/sin asistir), filtro por evento, búsqueda por nombre/email, filas expandibles con detalle de tickets |
| `apps/web-host/src/components/TicketScanner.tsx` | **Nuevo** | Escáner con 3 tabs: Cámara (jsQR + getUserMedia + botones Escanear/Detener + overlay pausado), Buscar por ID corto, Token JWT manual. Mensajes de error de cámara detallados por tipo de DOMException |
| `apps/web-host/src/components/EditEventForm.tsx` | Modificado | Botón "Eliminar zona" oculto cuando `zone.hasSold === true` |
| `apps/web-host/src/app/dashboard/page.tsx` | Modificado | Vistas `'attendees'` y `'scanner'` agregadas al tipo de `view`. Imports y renderizado de `AttendeesList` y `TicketScanner` |
| `apps/web-client/src/app/my-tickets/my-tickets.css` | Modificado | Tickets USED en rojo: `.badge-used` (rojo con borde), `.ticket-used` (tinte rojo + borde), `.ticket-scanned` (franja roja izquierda), `.qr-used .qr-label-text` (rojo) |
| `apps/web-client/src/app/my-tickets/page.tsx` | Modificado | Emoji badge "✔️ Usado" → "🔒 Usado" |

### Sesión del 3 de Mayo 2026 — Mi Perfil (usuarios), Foto de Avatar, Toast de Login en Localidades

| Archivo | Tipo de Cambio | Descripción |
| :--- | :--- | :--- |
| `libs/shared/prisma/schema.prisma` | Modificado | Nuevos campos en `User`: `avatarUrl`, `idType`, `idNumber`, `address`, `province`, `city`, `birthDate`, `citizenship` |
| `libs/shared/src/lib/dto/auth.dto.ts` | Modificado | Nuevo `UpdateProfileDto` con todos los campos opcionales del perfil |
| `apps/api/src/app/auth/auth.service.ts` | Modificado | Métodos `getProfile(userId)` y `updateProfile(userId, dto)` con bcrypt para password y select sin campo password |
| `apps/api/src/app/auth/auth.controller.ts` | Modificado | Endpoints `GET /auth/me` y `PATCH /auth/me` protegidos con `JwtAuthGuard` |
| `apps/api/src/app/upload/upload.controller.ts` | **Reescritura** | Nuevo tipo `user-avatar` → guarda en `uploads/users/{userId}/avatar/`. Separado completamente de directorio `organizers/`. |
| `apps/web-client/src/lib/api.ts` | Modificado | Interfaces `UserProfile`, `UpdateProfileData`. Funciones `getProfile()`, `updateProfile()`, `uploadUserAvatar()` |
| `apps/web-client/src/lib/AuthContext.tsx` | Modificado | Interfaz `User` extendida con campos de perfil. Nueva función `updateUser()` para sincronizar contexto sin re-login. |
| `apps/web-client/src/components/Navbar.tsx` | Modificado | Botón `👤 Mi Perfil` entre "Mis Tickets" y "Salir" |
| `apps/web-client/src/app/my-profile/page.tsx` | **Nuevo** | Página completa con 3 secciones: Datos de acceso, Identificación, Dirección. Avatar con upload inmediato. |
| `apps/web-client/src/app/my-profile/my-profile.css` | **Nuevo** | Estilos de la página de perfil: avatar circular, overlay de edición, grid de formulario, secciones. |
| `apps/web-client/src/app/events/[id]/EventDetailClient.tsx` | Modificado | Toast 🔒 amarillo cuando usuario no autenticado intenta seleccionar asiento. Auto-cierre 4s. Asientos numerados y botones GA ahora clicables para todos. |

### Sesión del 2 de Mayo 2026 — Logo, Planes Dinámicos, Bloqueo de Login, Reset Contraseña, CRUD Admin

| Archivo | Tipo de Cambio | Descripción |
| :--- | :--- | :--- |
| `apps/api/src/app/auth/auth.service.ts` | Modificado | Login bloquea organizadores PENDING/REJECTED con mensaje descriptivo |
| `apps/api/src/app/app.service.ts` | Nuevo método | `getPlans()` expone planes públicos consultando Prisma |
| `apps/api/src/app/app.controller.ts` | Modificado | Endpoint público `GET /api/plans` sin autenticación |
| `apps/api/src/app/upload/upload.controller.ts` | **Reescritura** | Crea directorios dinámicos: `uploads/organizers/{id}/logo/` y `.../events/{eventId}/`. Sin auth obligatoria (soporta registro sin token). |
| `apps/api/src/app/admin/admin.service.ts` | Modificado | `updateOrganizer` hashea contraseña con bcrypt si se provee |
| `apps/web-host/src/app/register/page.tsx` | Modificado | Paso 2: campo logo con preview. Paso 3: planes dinámicos desde API. |
| `apps/web-host/src/app/dashboard/page.tsx` | Modificado | Pantalla "Cuenta en Revisión" con botón "Cerrar Sesión y Volver" |
| `apps/web-host/src/lib/api.ts` | Modificado | `uploadImage()` acepta `type/eventId/organizerId`. Auth header condicional. `getPublicPlans()` añadido. |
| `apps/web-admin/app/dashboard/page.tsx` | Modificado | Logo en modales edición/creación org. Avatar en tabla muestra logo si existe. `useRef` para file inputs. |
| `apps/web-admin/lib/api.ts` | Modificado | Función `uploadImage()` añadida para subir logos desde el admin. |

---

## 6. 📝 Notas Técnicas Para el Desarrollador

- **NX Daemon**: NO funciona en este proyecto. Siempre hacer `npx nx build api` y luego `node dist/apps/api/main.js` para ver cambios del backend.
- **Puertos**: PostgreSQL en **5435**, Redis en **6380** (no estándar para evitar conflictos).
- **Prisma**: Versión **5.22.0** (bloqueada — v7+ tiene incompatibilidades de CLI). Al cambiar el schema correr `npx prisma db push --schema=libs/shared/prisma/schema.prisma` con la API **detenida** para poder regenerar el cliente.
- **JWT**: Tokens duran **24 horas** (`auth.module.ts` → `expiresIn: '24h'`).
- **Web Host**: Usar `npx next dev --port=4201` desde `apps/web-host/`.
- **Web Client**: Usar `npx next dev --port=4200` desde `apps/web-client/`.
- **Web Admin**: Usar `npx next dev --port=4202` desde `apps/web-admin/`.
- **Ticket sin relación a Seat**: El modelo `Ticket` no tiene `seatId`. La info del asiento está codificada en el QR JWT.
- **Pagos Mock**: El sistema de pagos es una simulación (`PaymentsModule`). Para producción: configurar `STRIPE_SECRET_KEY` en `.env`.
- **API URL en Móvil**: La app detecta automáticamente tu IP local si usas Expo Go.
- **ValidationPipe Global**: `main.ts` tiene `whitelist: true` y `transform: true`. Para el PATCH de eventos se usa `@Request()` para evitar que se filtren los campos de zona.
- **Directorios de uploads**: `uploads/organizers/{id}/logo|events/` para organizadores. `uploads/users/{id}/avatar/` para fotos de perfil de clientes. Directorio raíz servido como estático por NestJS.

---

## 7. 🔐 Reglas de Negocio de Edición de Zonas

| Campo       | ¿Editable si hay ventas? | Restricción                                     |
| :---------- | :----------------------- | :---------------------------------------------- |
| Nombre      | ❌ No                    | Bloqueado si `soldCount > 0`                    |
| Descripción | ✅ Sí                    | Siempre editable                                |
| Precio      | ❌ No                    | Bloqueado si `soldCount > 0`                    |
| Capacidad   | ✅ Sí                    | No puede ser menor a `soldCount` (vendidos)     |
| Nueva Zona  | ✅ Sí                    | Se puede agregar zonas nuevas siempre            |
| Eliminar Zona | ❌ (con ventas)        | Solo si la zona no tiene tickets vendidos        |

---

## 8. 🗺️ Próximos Pasos de Desarrollo

### Prioridad Alta

- [ ] Integración real con Stripe (reemplazar el mock)
- [ ] Emails transaccionales (confirmación de registro, aprobación y compra)
- [ ] Reportes financieros para organizadores
- [ ] Mover carpeta temporal del logo (se guarda en `uploads/organizers/{email_safe}/` en el registro, debería moverse a `uploads/organizers/{userId}/` tras crearse el usuario)
- [ ] Reemplazar foto de perfil anterior al subir una nueva (actualmente se acumulan archivos en `uploads/users/{id}/avatar/`)

### Prioridad Media

- [ ] Paginación en endpoints (eventos, órdenes, organizadores)
- [ ] Sistema de categorías de eventos
- [ ] Optimizar queries de findAll (no traer todos los seats si no es necesario)
- [ ] CDN para imágenes (actualmente servidas estáticamente desde el servidor NestJS)

### Prioridad Baja

- [ ] Websockets para actualización en tiempo real del mapa de asientos
- [ ] Rate limiting en API
- [ ] CI/CD pipeline
- [ ] Tests unitarios e integración

### Completado ✅

- [x] ~~Generar imagen QR real con librería `qrcode`~~ ✅
- [x] ~~Búsqueda y filtrado de eventos~~ ✅
- [x] ~~Upload de imágenes para eventos~~ ✅
- [x] ~~Edición y eliminación de eventos~~ ✅
- [x] ~~Gestión de estados (Draft/Published/Inactive)~~ ✅
- [x] ~~Desactivación automática de eventos pasados~~ ✅
- [x] ~~Edición de descripciones de zonas~~ ✅ (31 Mar 2026)
- [x] ~~Protección de capacidad (no reducir bajo vendidos)~~ ✅ (31 Mar 2026)
- [x] ~~Gestión dinámica de asientos al cambiar capacidad~~ ✅ (31 Mar 2026)
- [x] ~~Registro de organizadores con campos Ecuador (provincia/ciudad)~~ ✅ (5 Abr 2026)
- [x] ~~Panel Global Admin: aprobar, editar, eliminar organizadores~~ ✅ (5 Abr 2026)
- [x] ~~Modal de edición completo en Global Admin~~ ✅ (5 Abr 2026)
- [x] ~~Bloqueo de acceso en Host si cuenta no está APROBADA~~ ✅ (5 Abr 2026)
- [x] ~~Arquitectura correcta de rutas Next.js (page.tsx) en web-host~~ ✅ (5 Abr 2026)
- [x] ~~Logout con redirección automática al login~~ ✅ (5 Abr 2026)
- [x] ~~Corrección de Login Automático tras Registro de Host~~ ✅ (1 May 2026)
- [x] ~~Dashboard de Host aislado a sus propios eventos (/events/me)~~ ✅ (1 May 2026)
- [x] ~~Gestión de Planes en Global Admin (CRUD completo)~~ ✅ (2 May 2026)
- [x] ~~Planes dinámicos en registro de Host (cargados desde BD)~~ ✅ (2 May 2026)
- [x] ~~Gestión de Usuarios del Dashboard (Admins y Editores)~~ ✅ (2 May 2026)
- [x] ~~Reset de contraseña de organizadores desde Global Admin~~ ✅ (2 May 2026)
- [x] ~~Logo de organización: subida en registro + edición admin + avatar en tabla~~ ✅ (2 May 2026)
- [x] ~~Estructura de directorios organizada por organizador y evento~~ ✅ (2 May 2026)
- [x] ~~Bloqueo de login para PENDING/REJECTED con mensaje descriptivo~~ ✅ (2 May 2026)
- [x] ~~Botón "Cerrar Sesión" en pantalla Cuenta en Revisión~~ ✅ (2 May 2026)
- [x] ~~Endpoint público GET /api/plans para formulario de registro~~ ✅ (2 May 2026)
- [x] ~~Gestión de Planes en Global Admin (CRUD completo)~~ ✅ (2 May 2026)
- [x] ~~Planes dinámicos en registro de Host (cargados desde BD)~~ ✅ (2 May 2026)
- [x] ~~Gestión de Usuarios del Dashboard (Admins y Editores con roles)~~ ✅ (2 May 2026)
- [x] ~~Reset de contraseña de organizadores desde Global Admin~~ ✅ (2 May 2026)
- [x] ~~Logo de organización: subida en registro, edición admin y tabla con avatar~~ ✅ (2 May 2026)
- [x] ~~Estructura de directorios organizada por organizador/evento~~ ✅ (2 May 2026)
- [x] ~~Bloqueo de login para cuentas PENDING/REJECTED con mensaje descriptivo~~ ✅ (2 May 2026)
- [x] ~~Botón "Cerrar Sesión" en pantalla de Cuenta en Revisión~~ ✅ (2 May 2026)
- [x] ~~Página Mi Perfil para usuarios (Portal Cliente): foto avatar, datos personales, identificación, dirección~~ ✅ (3 May 2026)
- [x] ~~Página Asistentes en Panel Host: compradores por evento, tickets comprados/usados, estado de asistencia, expandible~~ ✅ (8 May 2026)
- [x] ~~Escáner de Tickets en Panel Host: cámara QR (jsQR), búsqueda por ID corto, token manual, Escanear/Detener~~ ✅ (8 May 2026)
- [x] ~~Endpoint GET /orders/attendees/me para lista de asistentes del organizador~~ ✅ (8 May 2026)
- [x] ~~Endpoint POST /tickets/validate-by-id para validar por ID corto~~ ✅ (8 May 2026)
- [x] ~~Botón "Eliminar zona" oculto cuando la zona tiene ventas activas~~ ✅ (8 May 2026)
- [x] ~~Tickets USED en rojo en Portal Cliente: badge, borde, timestamp escaneado, "Ticket ya utilizado"~~ ✅ (8 May 2026)
- [x] ~~Endpoints GET/PATCH /api/auth/me para perfil de usuario~~ ✅ (3 May 2026)
- [x] ~~Upload de foto de perfil en directorio independiente uploads/users/{id}/avatar/~~ ✅ (3 May 2026)
- [x] ~~Toast de login al intentar seleccionar asientos sin autenticación (auto-cierre 4s)~~ ✅ (3 May 2026)
- [x] ~~Campos de perfil extendidos en User (avatarUrl, idType, idNumber, province, city, birthDate, citizenship)~~ ✅ (3 May 2026)

---

## 9. 🐛 Bugs Conocidos / Deuda Técnica

- **Lint warnings `any`**: Múltiples archivos usan `any` type (especialmente `events.service.ts` y `EditEventForm.tsx`). Funcional pero debería tiparse mejor.
- **Console.log en create**: `events.service.ts` línea 10 tiene un `console.log` de debug que debería removerse.
- **NX Daemon**: No funciona, requiere rebuild manual del backend. Investigar fix o migrar a otro método de serve.
- **Galería de imágenes en edición**: Las imágenes de galería existentes se acumulan en vez de reemplazarse (al editar, se suman las nuevas a las anteriores).
