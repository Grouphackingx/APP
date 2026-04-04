# 🟢 PUNTO DE RESTAURACIÓN: OPENTICKET (Sistema Completo)

**Fecha de Última Actualización:** 31 de Marzo de 2026, 00:00
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

| Rol                    | Email                    | Password     | Dónde usarlo                           |
| :--------------------- | :----------------------- | :----------- | :------------------------------------- |
| Administrador Global   | admin@admin.com          | admin123     | `http://localhost:4202` (web-admin)    |
| **Organizador (Host)** | `admin@openticket.com`   | `admin123`   | http://localhost:4201 (Panel Host)     |
| **Cliente (User)**     | `cliente@openticket.com` | `cliente123` | http://localhost:4200 (Portal Cliente) |
| **Staff (Validator)**  | `staff@openticket.com`   | `staff123`   | Mobile App (Expo Go)                   |

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
| POST   | `/api/upload`                   | JWT         | ✅ OK  | Subir imágenes                          |

### Web Client (Puerto 4200)

| Ruta           | Estado | Descripción                                                |
| :------------- | :----- | :--------------------------------------------------------- |
| `/`            | ✅     | Home: Hero + catálogo de eventos en grid + buscador        |
| `/login`       | ✅     | Formulario de login con JWT y localStorage                 |
| `/register`    | ✅     | Formulario de registro                                     |
| `/events/[id]` | ✅     | Detalle del evento + mapa de asientos interactivo + compra |
| `/my-tickets`  | ✅     | Lista de tickets comprados con QR y estado                 |

### Web Host (Puerto 4201)

| Sección          | Estado | Descripción                                            |
| :--------------- | :----- | :----------------------------------------------------- |
| Login            | ✅     | Login para organizadores                               |
| Dashboard        | ✅     | Stats + tabla de eventos con pestañas (Activos/Inactivos/Borrador) |
| Crear Evento     | ✅     | Formulario completo con zonas, galería, mapa, video    |
| Editar Evento    | ✅     | Edición de zonas con protección de ventas activas      |
| Eliminar Evento  | ✅     | Solo visible si 0 tickets vendidos                     |

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

## 5. 📁 Archivos Modificados en Esta Sesión

| Archivo | Tipo de Cambio | Descripción |
| :--- | :--- | :--- |
| `apps/api/src/app/events/events.service.ts` | **Reescritura mayor** | Método `update` completamente nuevo con sanitización, protección de capacidad, gestión de asientos. `findAll` incluye seats. |
| `apps/api/src/app/events/events.controller.ts` | Modificado | PATCH usa `@Request()` para evitar whitelist del ValidationPipe |
| `apps/web-host/src/components/EditEventForm.tsx` | Mejorado | soldCount, validación de capacidad, protección visual de campos bloqueados |
| `libs/shared/src/lib/dto/events.dto.ts` | Ampliado | `id` opcional en CreateZoneDto, `zones` opcional, nuevo `UpdateEventDto` |

---

## 6. 📝 Notas Técnicas Para el Desarrollador

- **NX Daemon**: NO funciona en este proyecto. Siempre hacer `npx nx build api` y luego `node dist/apps/api/main.js` para ver cambios del backend.
- **Puertos**: PostgreSQL en **5435**, Redis en **6380** (no estándar para evitar conflictos).
- **Prisma**: Versión **5.22.0** (bloqueada — v7+ tiene incompatibilidades de CLI).
- **Web Host**: Usar `npx next dev --port=4201` desde `apps/web-host/`.
- **Web Client**: Usar `npx next dev --port=4200` desde `apps/web-client/`.
- **Ticket sin relación a Seat**: El modelo `Ticket` no tiene `seatId`. La info del asiento está codificada en el QR JWT.
- **Pagos Mock**: El sistema de pagos es una simulación (`PaymentsModule`). Para producción: configurar `STRIPE_SECRET_KEY` en `.env`.
- **API URL en Móvil**: La app detecta automáticamente tu IP local si usas Expo Go.
- **ValidationPipe Global**: `main.ts` tiene `whitelist: true` y `transform: true`. Para el PATCH de eventos se usa `@Request()` para evitar que se filtren los campos de zona.

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
- [ ] Panel de Administración (dashboard de ventas, gestión de usuarios)
- [ ] Emails transaccionales (confirmación de compra)
- [ ] Reportes financieros para organizadores

### Prioridad Media

- [ ] Paginación en endpoints (eventos, órdenes)
- [ ] Sistema de categorías de eventos
- [ ] Optimizar queries de findAll (no traer todos los seats si no es necesario)

### Prioridad Baja

- [ ] Websockets para actualización en tiempo real del mapa de asientos
- [ ] Rate limiting en API
- [ ] CI/CD pipeline
- [ ] Tests unitarios e integración
- [ ] CDN para imágenes

### Completado ✅

- [x] ~~Generar imagen QR real con librería `qrcode`~~ ✅
- [x] ~~Búsqueda y filtrado de eventos~~ ✅
- [x] ~~Upload de imágenes para eventos~~ ✅
- [x] ~~Edición y eliminación de eventos~~ ✅
- [x] ~~Gestión de estados (Draft/Published/Inactive)~~ ✅
- [x] ~~Desactivación automática de eventos pasados~~ ✅
- [x] ~~Edición de descripciones de zonas~~ ✅ (resuelto 31 Mar 2026)
- [x] ~~Protección de capacidad (no reducir bajo vendidos)~~ ✅ (resuelto 31 Mar 2026)
- [x] ~~Gestión dinámica de asientos al cambiar capacidad~~ ✅ (resuelto 31 Mar 2026)

---

## 9. 🐛 Bugs Conocidos / Deuda Técnica

- **Lint warnings `any`**: Múltiples archivos usan `any` type (especialmente `events.service.ts` y `EditEventForm.tsx`). Funcional pero debería tiparse mejor.
- **Console.log en create**: `events.service.ts` línea 10 tiene un `console.log` de debug que debería removerse.
- **NX Daemon**: No funciona, requiere rebuild manual del backend. Investigar fix o migrar a otro método de serve.
- **Galería de imágenes en edición**: Las imágenes de galería existentes se acumulan en vez de reemplazarse (al editar, se suman las nuevas a las anteriores).
