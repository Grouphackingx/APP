# 🟢 PUNTO DE RESTAURACIÓN: OPENTICKET (Sistema Completo)

**Fecha de Última Actualización:** 20 de Mayo de 2026
**Estado del Proyecto:** ✅ COMPLETO Y VERIFICADO (Fases 1-4 + Portal Cliente: Mi Perfil + Toast de login + Tickets usados en rojo + Hero Section con carrusel interactivo 3:4 + Sección Eventos Destacados (condicional) + Panel Host: Asistentes + Escáner de tickets + Página Usuarios (OrganizerMembers ADMIN/STAFF) + Página Perfil + Panel Admin: Gestión Global de Eventos con Destacados + Edición/Eliminación de eventos por Admin + Imagen Retrato 3:4 por evento)

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
| GET    | `/api/auth/me/organizer`        | JWT         | ✅ OK  | Perfil completo: HOST (con organizerProfile) o OrganizerMember autenticado |
| PATCH  | `/api/auth/me/basic`            | JWT         | ✅ OK  | Actualizar nombre, email, teléfono, avatar — funciona para HOST y OrganizerMember |
| PATCH  | `/api/auth/me/password`         | JWT         | ✅ OK  | Cambiar contraseña con verificación de contraseña actual (bcrypt compare + hash) |
| PATCH  | `/api/auth/me/organizer-profile`| JWT (HOST)  | ✅ OK  | Actualizar datos de organización: nombre, descripción, logo, dirección, provincia, ciudad. 403 si es miembro. |
| POST   | `/api/upload`                   | Opcional    | ✅ OK  | Subir imágenes — tipos: `logo`, `event`, `user-avatar`, `member-avatar`. Directorios: `uploads/organizers/{id}/logo|events/`, `uploads/users/{id}/avatar/`, `uploads/organizers/{orgId}/members/{memberId}/avatar/` |
| GET    | `/api/plans`                    | No          | ✅ OK  | Planes públicos (para formulario de registro) |
| GET    | `/api/admin/plans`              | JWT (ADMIN) | ✅ OK  | CRUD Planes - Listar |
| POST   | `/api/admin/plans`              | JWT (ADMIN) | ✅ OK  | CRUD Planes - Crear |
| PATCH  | `/api/admin/plans/:id`          | JWT (ADMIN) | ✅ OK  | CRUD Planes - Editar |
| DELETE | `/api/admin/plans/:id`          | JWT (ADMIN) | ✅ OK  | CRUD Planes - Eliminar |
| GET    | `/api/admin/users`              | JWT (ADMIN) | ✅ OK  | CRUD Usuarios Admin - Listar |
| POST   | `/api/admin/users`              | JWT (ADMIN) | ✅ OK  | CRUD Usuarios Admin - Crear |
| PATCH  | `/api/admin/users/:id`          | JWT (ADMIN) | ✅ OK  | CRUD Usuarios Admin - Editar |
| DELETE | `/api/admin/users/:id`          | JWT (ADMIN) | ✅ OK  | CRUD Usuarios Admin - Eliminar |
| GET    | `/api/admin/events`             | JWT (ADMIN) | ✅ OK  | Listar todos los eventos globalmente (con zonas, seats y organizador) |
| PATCH  | `/api/admin/events/:id/featured`| JWT (ADMIN) | ✅ OK  | Activar/desactivar destacado de evento con duración en días |

### Web Client (Puerto 4200)

| Ruta           | Estado | Descripción                                                |
| :------------- | :----- | :--------------------------------------------------------- |
| `/`            | ✅     | Hero Section split (Anton font, titular izq. reducido 10% + carrusel interactivo coverflow der. con los 3 próximos eventos) + Catálogo de eventos en grid + buscador colapsable en header con icono SVG outlined |
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
| Usuarios             | ✅     | Gestión de miembros OrganizerMember: crear ADMIN/STAFF, editar, eliminar, subir avatar. Solo visible para el HOST principal (no para miembros). |
| Perfil               | ✅     | Actualización de perfil personal (nombre, email, teléfono, avatar con upload), datos de organización (solo HOST: nombre org, descripción, logo, dirección), cambio de contraseña con verificación de contraseña actual. |

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
| Gestión de Eventos   | ✅     | Directorio global de eventos con pestañas (Activos/Inactivos/Borrador), contadores por categoría |
| Destacar Evento      | ✅     | Botón ⭐ Destacar con duración en días. Botón rojo para quitar. Badge amarillo con fecha de expiración |
| Editar Evento (Admin)| ✅     | Formulario completo idéntico al de organizadores (nombre, imágenes, zonas, estado, etc.) |
| Eliminar Evento      | ✅     | Botón 🗑️ solo visible si el evento no tiene tickets vendidos |

### Web Client (Puerto 4200) — Actualizaciones (20 Mayo 2026)

| Sección              | Estado | Descripción                                                        |
| :------------------- | :----- | :----------------------------------------------------------------- |
| Sección Destacados   | ✅     | `FeaturedEventsSection` — aparece solo cuando hay eventos con `isFeatured: true` activo. Tarjetas con imagen 1:1, badge dorado "★ DESTACADO", hover sutil. Sin overlay oscuro ni brillo de fondo. |
| Carrusel Hero        | ✅     | Ahora usa `portraitImageUrl` (3:4) como imagen principal. Aspect-ratio de tarjetas actualizado a `3/4`. Posición vertical ajustada a `top: 45%`. |
| EventCard (general)  | ✅     | Usa `squareImageUrl` (1:1) como imagen principal. Placeholder `/default-portrait.svg` si no hay imagen. |
| Página de Evento     | ✅     | Banner panorámico con `aspect-ratio: 289/111` (exacto para 2023×777px), `object-fit: contain`, `border-radius: 15px`. Sin recorte de imagen. |
| Imagen Retrato 3:4   | ✅     | Campo `portraitImageUrl` disponible en formularios de creación/edición de eventos (web-host y web-admin). |

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

## 4. 🔧 Cambios Realizados en Sesiones Anteriores

### Sesión del 19 de Mayo 2026 — Carrusel Hero Interactivo (Coverflow 1:1), Refinamiento Visual

#### 4.0.A. Carrusel Hero — HeroCarousel.tsx (Nuevo Componente)

**Archivo**: `apps/web-client/src/components/HeroCarousel.tsx` (nuevo)

Componente cliente (`'use client'`) con efecto coverflow de tres tarjetas (prev/active/next):
- **Circular motion**: Truco de "teleport con dos rAFs" — la tarjeta que va a envolver se coloca instantáneamente fuera de pantalla (sin transición CSS via `transition: none !important`), y en el siguiente frame de pintura desliza hacia su nueva posición. Esto evita que se vea el deslizamiento "a través del centro".
- **Auto-avance**: Intervalo de 4500ms. Se pausa al hacer hover. `navigateRef` y `activeRef` evitan closures obsoletos dentro del setInterval.
- **Navegación**: Dots de navegación en la parte inferior. Click en tarjeta lateral avanza al evento correspondiente.
- **Fallback**: Si no hay eventos, muestra panel vacío con texto "Próximamente nuevos eventos".

#### 4.0.B. Actualización de page.tsx — Selección de 3 próximos eventos

**Archivo**: `apps/web-client/src/app/page.tsx`

- Calcula los 3 próximos eventos futuros publicados ordenados por fecha ascendente para el carrusel.
- Fallback: si no hay eventos futuros, usa los primeros 3 publicados.
- Reemplazó el `nextEvent` único (imagen estática) por `carouselEvents[]` para el nuevo `HeroCarousel`.

#### 4.0.C. CSS del Carrusel y Hero — global.css

**Archivo**: `apps/web-client/src/app/global.css`

Cambios acumulados en esta sesión:

| Propiedad CSS | Valor Anterior | Valor Nuevo | Motivo |
|---|---|---|---|
| `.hero-split grid-template-columns` | `55fr 45fr` | `1fr 1fr` | Panel derecho necesita más espacio para tarjetas cuadradas |
| `.hero-carousel-card height` | `90%` | `75%` | Relación de aspecto 1:1 requiere reducir alto para que el ancho no desborde el panel |
| `.hero-carousel-card aspect-ratio` | `2 / 3` | `1 / 1` | Imágenes de eventos son cuadradas — corrección de distorsión |
| `.hcc-enter-right translate` | `+200%` | `+140%` | Posición de entrada ajustada a tarjetas cuadradas |
| `.hcc-enter-left translate` | `-200%` | `-140%` | Idem dirección opuesta |
| `.hero-split-right background` | `#08090b` → `var(--bg-primary)` → | `transparent` | El contenedor blending con fondo de página para no verse como cuadrado |
| `.hero-split-right box-shadow` | `0 24px 64px ... + 0 0 0 1px rgba(...)` | `sin box-shadow` | Eliminación del borde del contenedor |
| `.hero-split-right border-radius` | `20px` | `eliminado` | Sin contenedor visible, no se necesita |
| `.hero-split-right::before/::after` | — | Gradientes `var(--bg-primary) → transparent` al 22% de ancho | Fade lateral: tarjetas parciales se disuelven en vez de cortarse abruptamente |
| `.hero-carousel-dots z-index` | `10` | `20` | Por encima de los pseudo-elementos de fade (z-index 10) |
| `.hero-split-left transform` | — | `scale(0.9); transform-origin: top left` | Reducción visual uniforme de todo el contenido izquierdo en 10% |
| `.hero-split-headline margin-bottom` | `1.75rem` | `eliminado` | Iguala el espacio titular→subtítulo con el espacio subtítulo→botones (ambos usan el `gap: 1.5rem` del flex) |

#### 4.0.D. Icono de búsqueda SVG en Navbar

**Archivo**: `apps/web-client/src/components/SearchBar.tsx`

- Reemplazado el emoji `🔍` (en ambas instancias: botón colapsable + ícono dentro del input expandido) por SVG inline outlined.
- SVG: `<circle cx="11" cy="11" r="8"/>` + `<line x1="21" y1="21" x2="16.65" y2="16.65"/>`, `stroke="currentColor"`, `strokeWidth="2"`, `strokeLinecap/Linejoin="round"`. Sin relleno. 18px en botón, 16px dentro del input.

---

### Sesión del 17-18 de Mayo 2026 (Continuación) — Avatar Miembros, Página Perfil Host, Hero Section Web Client

#### 4.A. Ruta de Avatar de Miembros Corregida

**Archivo**: `apps/api/src/app/upload/upload.controller.ts`
- Tipo `member-avatar`: el destino cambió de `uploads/members/{memberId}/avatar/` a `uploads/organizers/{orgUserId}/members/{memberId}/avatar/`, donde `orgUserId` se obtiene del JWT del organizador autenticado (`req.user.sub`).
- La URL retornada también refleja la nueva ruta, manteniendo consistencia con la estructura jerárquica de organización.

#### 4.B. Nuevos DTOs de Perfil

**Archivo**: `libs/shared/src/lib/dto/auth.dto.ts`

Tres DTOs nuevos añadidos antes de `UpdateProfileDto`:
- `UpdateBasicInfoDto` — campos opcionales: `name`, `email`, `phone`, `avatarUrl`
- `ChangePasswordDto` — `currentPassword` (required) + `newPassword` (min 6 chars)
- `UpdateOrganizerProfileInfoDto` — campos opcionales: `organizationName`, `organizationDescription`, `organizationLogo`, `address`, `province`, `city`

#### 4.C. Métodos de Perfil en AuthService y Endpoints en AuthController

**Archivo**: `apps/api/src/app/auth/auth.service.ts`

Cuatro métodos nuevos:
- `getOrganizerFullProfile(userId, isMember)` — retorna `{ type: 'host', user }` o `{ type: 'member', member }` según si es OrganizerMember o User principal, sin campo `password`.
- `updateBasicInfo(userId, isMember, dto)` — actualiza nombre/teléfono/avatarUrl en User o OrganizerMember según contexto.
- `changePassword(userId, isMember, currentPassword, newPassword)` — verifica contraseña actual con `bcrypt.compare` antes de actualizar.
- `updateOrganizerProfileInfo(userId, dto)` — actualiza el OrganizerProfile asociado al userId (solo para HOST principal).

**Archivo**: `apps/api/src/app/auth/auth.controller.ts`

Cuatro endpoints nuevos protegidos con `JwtAuthGuard`:
- `GET /auth/me/organizer` — perfil completo
- `PATCH /auth/me/basic` — datos básicos (nombre, email, teléfono, avatar)
- `PATCH /auth/me/password` — cambiar contraseña con verificación
- `PATCH /auth/me/organizer-profile` — datos de organización (403 si `isMember`)

#### 4.D. AuthContext `updateUser` en Web Host

**Archivo**: `apps/web-host/src/lib/AuthContext.tsx`
- Agregada función `updateUser(updates: Partial<User>)` a la interfaz y a la implementación del `AuthProvider`.
- Persiste los cambios en `localStorage` (`ot_host_user`) y actualiza el estado en memoria para que el Sidebar refleje el nuevo nombre/logo/avatar sin necesidad de re-login.

#### 4.E. Funciones API de Perfil en Web Host

**Archivo**: `apps/web-host/src/lib/api.ts`

Cuatro funciones nuevas:
- `getMyOrganizerProfile(token)` — `GET /auth/me/organizer`
- `updateMyBasicInfo(data, token)` — `PATCH /auth/me/basic`
- `changeMyPassword(currentPassword, newPassword, token)` — `PATCH /auth/me/password`
- `updateMyOrganizerProfileInfo(data, token)` — `PATCH /auth/me/organizer-profile`

#### 4.F. Componente OrganizerProfile (Nuevo)

**Archivo**: `apps/web-host/src/components/OrganizerProfile.tsx`

Vista de perfil con tres tarjetas:
1. **Información Personal** — nombre, email, teléfono + avatar circular con botón de upload. Para HOST usa `uploadImage(file, token, 'logo')` para el logo de organización; para miembros usa `uploadMemberAvatar(file, memberId, token)` en la ruta corregida.
2. **Datos de Organización** — nombre de org, descripción, logo (upload circular), dirección, provincia, ciudad. Solo visible para HOST principal.
3. **Cambiar Contraseña** — tres campos (actual, nueva, confirmar) con toggle de visibilidad por campo. Valida que la nueva coincida antes de hacer la llamada al API.

Sub-componentes internos: `SaveMsg` (mensaje éxito/error con auto-reset 4s) y `PwField` (campo de contraseña con toggle).

Tras guardar, llama a `updateUser()` del `AuthContext` para sincronizar nombre/email/logo en el Sidebar.

#### 4.G. Integración en Dashboard y Sidebar

**Archivos**: `apps/web-host/src/components/Sidebar.tsx` y `apps/web-host/src/app/dashboard/page.tsx`

- Nuevo orden del menú sidebar (final): Inicio → Crear Evento → Mis Eventos → Asistentes → Usuarios (solo HOST principal) → Escáner de Tickets → Perfil
- Vista `'profile'` añadida al tipo union de `view` en `dashboard/page.tsx`
- Import y bloque de renderizado de `OrganizerProfile` añadido

#### 4.H. Hero Section en Web Client

**Archivo**: `apps/web-client/src/app/global.css`
- Import de fuente `Anton` de Google Fonts añadido al `@import` inicial.
- Nuevo bloque CSS `.hero-split` (~60 líneas):
  - Grid de dos columnas (`55fr 45fr`), altura mínima `100vh`, `padding-top: 64px` para compensar el header fijo.
  - `.hero-split-left` — fondo oscuro, flex column, padding lateral responsivo con `clamp()`.
  - `.hero-split-headline` — `font-family: 'Anton'`, `font-size: clamp(3.8rem, 7.5vw, 7.5rem)`, `line-height: 0.9`, uppercase. `.accent` en color primario (verde).
  - `.hero-split-cta` — botón blanco pill con texto negro, uppercase. `.hero-split-cta-ghost` — variante transparente con borde sutil.
  - `.hero-split-right` — `position: relative; overflow: hidden`. Imagen a pantalla completa:
    - `.hero-event-img-wrap { display: block; width: 100%; height: 100%; }`
    - `.hero-event-img { width: 100%; height: 100%; object-fit: cover; object-position: center; }`
    - Efecto hover: `transform: scale(1.04)` en 0.6s.
  - `.hero-no-event` — estado vacío con borde punteado cuando no hay eventos.
  - Responsive (960px): grid colapsa a 1 columna; panel derecho con `min-height: 55vw`. (480px): `min-height: 80vw`.

**Archivo**: `apps/web-client/src/app/page.tsx`
- Cálculo de `nextEvent`: primer evento futuro publicado ordenado por fecha ascendente; fallback al primer evento si no hay futuros.
- Hero Section visible solo cuando no hay búsqueda activa (`!query`).
- Panel derecho: `<Link href="/events/{id}" className="hero-event-img-wrap">` con `<img>` usando `squareImageUrl || imageUrl || bannerImageUrl || undefined` (prioriza 1:1, fallback a panorámica).
- Fallback vacío: `.hero-no-event` con icono 🎵 y texto "Próximamente nuevos eventos".

---

### Sesión del 17 de Mayo 2026 — Eventos Destacados, Gestión Global de Eventos, Limpieza de UI

#### 4.1. Sistema de Eventos Destacados (Featured Events)

**Modelo de datos**: Se agregaron los campos `isFeatured` (Boolean, default false) y `featuredUntil` (DateTime?, nullable) al modelo `Event` en `schema.prisma`. Sincronizado con `npx prisma db push`.

**Backend**:
- `AdminService.getAllEvents()`: Retorna todos los eventos con relaciones `organizer.organizerProfile` y `zones.seats` para poder validar tickets vendidos.
- `AdminService.toggleEventFeatured(id, isFeatured, durationDays?)`: Calcula `featuredUntil` sumando `durationDays` a la fecha actual. Al desactivar, pone ambos campos en `false`/`null`.
- `AdminController`: Endpoints `GET /api/admin/events` y `PATCH /api/admin/events/:id/featured` protegidos con `@Roles(Role.ADMIN)`.

**Frontend Admin**:
- Navegación "🌟 Eventos" en el Sidebar.
- Vista con pestañas Activos/Inactivos/Borrador (contadores dinámicos).
- Botón ⭐ Destacar: al presionar, solicita duración en días vía `window.prompt`.
- Botón rojo "Quitar Destacado" con confirmación.
- Badge amarillo "⭐ Destacado (hasta DD/MM/YYYY)" en la columna de estado.

#### 4.2. Edición de Eventos desde Admin Global

Se copió `EditEventForm.tsx` del `web-host` al `web-admin/components/`. El admin puede editar cualquier campo del evento (título, imágenes, zonas, estado, etc.) con las mismas validaciones de protección de ventas.

#### 4.3. Eliminación de Eventos desde Admin Global

Se agregó botón 🗑️ que solo aparece si el evento no tiene tickets vendidos (misma lógica que en el panel de organizadores). Pide confirmación antes de eliminar.

#### 4.4. Limpieza de UI en Web Client (Página Principal)

- **Eliminados**: Hero section ("La nueva era de eventos digitales"), botones "Explorar eventos" y "Crear cuenta", textos estadísticos ("Eventos encontrados", "Digital y seguro", "Entrada dinámica", "2", "100%", "QR"), botón "Eventos" del header, texto "Descubre eventos que te inspiran".
- **Buscador colapsable**: Movido a la cabecera (Navbar), junto al botón "Iniciar Sesión". Se muestra solo como icono de lupa (🔍); al presionarlo se expande un campo de texto funcional para buscar eventos.
- **Padding mejorado**: Espaciado estratégico en títulos/subtítulos de sección "Próximos Eventos".
- **Tarjetas de evento**: Eliminado botón "Ver Detalles" para reducir altura vertical.

#### 4.5. Campo de Imagen Simplificado

Se eliminó el campo "Imagen del evento (General)" del formulario de creación/edición de eventos. Ahora las imágenes principales son:
- **Banner Panorámico** (2000x576) — para cabecera del detalle
- **Imagen Cuadrada** (1:1) — como imagen general/tarjeta

---

### Sesión del 30-31 Marzo 2026 — Edición de Zonas en Eventos

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

### Sesión del 20 de Mayo 2026 — Destacados en Web Client, Imagen Retrato 3:4, Fixes de Banner

| Archivo | Tipo de Cambio | Descripción |
| :--- | :--- | :--- |
| `apps/api/src/app/scheduler/featured-events.scheduler.ts` | **Nuevo** | Cron job `@Cron(EVERY_HOUR)` que desactiva `isFeatured` cuando `featuredUntil < now` |
| `apps/api/src/app/scheduler/scheduler.module.ts` | **Nuevo** | Módulo NestJS que encapsula el scheduler |
| `apps/api/src/app/app.module.ts` | Modificado | Registra `ScheduleModule.forRoot()` + `SchedulerModule` |
| `apps/api/src/app/events/events.service.ts` | Modificado | `portraitImageUrl` agregado a `allowedEventFields` en método `update` |
| `libs/shared/prisma/schema.prisma` | Modificado | Campo `portraitImageUrl String?` agregado al modelo `Event` |
| `apps/web-client/src/components/FeaturedEventsSection.tsx` | **Nuevo** | Sección de eventos destacados: tarjetas 1:1, badge dorado, condicional (solo si hay destacados), sin overlay oscuro ni brillo de fondo |
| `apps/web-client/src/components/HeroCarousel.tsx` | Modificado | Usa `portraitImageUrl` como imagen principal (fallback: square → image → banner). Interface `CarouselEvent` actualizada. |
| `apps/web-client/src/components/EventCard.tsx` | Modificado | Usa `squareImageUrl` como imagen principal (1:1). Fallback: `imageUrl → /default-portrait.svg` |
| `apps/web-client/src/lib/api.ts` | Modificado | `EventItem` interface: campos `isFeatured`, `featuredUntil`, `portraitImageUrl` agregados |
| `apps/web-client/src/app/page.tsx` | Modificado | Separa publicados en `featuredEvents` y `generalEvents`. Carrusel usa todos los publicados. Sección destacados condicional. `CarouselEvent` type con `portraitImageUrl`. |
| `apps/web-client/src/app/global.css` | Modificado | Bloque `.featured-section` completo (sin overlay, sin brillo dorado). `.event-card-image` aspect-ratio 1:1. `.hero-carousel-card` aspect-ratio 3:4, `top: 45%`, `height: 85%`. `.event-detail-hero` aspect-ratio 289/111, `object-fit: contain`, `border-radius: 15px`, sin `height` fijo. |
| `apps/web-client/public/default-portrait.svg` | **Nuevo** | Placeholder SVG oscuro 3:4 para eventos sin imagen |
| `apps/web-host/src/components/CreateEventForm.tsx` | Modificado | Campo "Imagen Retrato (3:4)" con upload, preview y nota 1200×1600px |
| `apps/web-host/src/components/EditEventForm.tsx` | Modificado | Campo "Imagen Retrato (3:4)" con upload, preview y preload del valor existente |
| `apps/web-admin/components/EditEventForm.tsx` | Modificado | Campo "Imagen Retrato (3:4)" con upload, preview y preload del valor existente |

### Sesión del 19 de Mayo 2026 — Carrusel Hero Coverflow, Refinamiento Visual

| Archivo | Tipo de Cambio | Descripción |
| :--- | :--- | :--- |
| `apps/web-client/src/components/HeroCarousel.tsx` | **Nuevo** | Carrusel coverflow con 3 tarjetas, circular motion via doble rAF teleport, auto-avance 4.5s, pausa en hover, dots navegación |
| `apps/web-client/src/app/page.tsx` | Modificado | Calcula 3 próximos eventos futuros para carrusel; reemplaza `nextEvent` único por `carouselEvents[]` |
| `apps/web-client/src/app/global.css` | Modificado | aspect-ratio 1:1, altura 75%, columnas 1fr 1fr, contenedor transparente sin borde, gradientes fade lateral, escala izquierda -10%, spacing headline ajustado, dots z-index 20 |
| `apps/web-client/src/components/SearchBar.tsx` | Modificado | Emoji 🔍 reemplazado por SVG inline outlined (circle + line, strokeWidth 2, sin relleno) en botón y en input expandido |

### Sesión del 17-18 de Mayo 2026 (Continuación) — Avatar Miembros, Perfil Host, Hero Section

| Archivo | Tipo de Cambio | Descripción |
| :--- | :--- | :--- |
| `apps/api/src/app/upload/upload.controller.ts` | Modificado | Tipo `member-avatar` ahora guarda en `uploads/organizers/{orgUserId}/members/{memberId}/avatar/` en vez del directorio plano anterior |
| `libs/shared/src/lib/dto/auth.dto.ts` | Modificado | Nuevos DTOs: `UpdateBasicInfoDto`, `ChangePasswordDto`, `UpdateOrganizerProfileInfoDto` |
| `apps/api/src/app/auth/auth.service.ts` | Modificado | Cuatro métodos nuevos: `getOrganizerFullProfile`, `updateBasicInfo`, `changePassword`, `updateOrganizerProfileInfo` |
| `apps/api/src/app/auth/auth.controller.ts` | Modificado | Cuatro endpoints nuevos: `GET /auth/me/organizer`, `PATCH /auth/me/basic`, `PATCH /auth/me/password`, `PATCH /auth/me/organizer-profile` |
| `apps/web-host/src/lib/AuthContext.tsx` | Modificado | Función `updateUser(updates)` añadida para sincronizar perfil en contexto y localStorage sin re-login |
| `apps/web-host/src/lib/api.ts` | Modificado | Cuatro funciones nuevas: `getMyOrganizerProfile`, `updateMyBasicInfo`, `changeMyPassword`, `updateMyOrganizerProfileInfo` |
| `apps/web-host/src/components/OrganizerProfile.tsx` | **Nuevo** | Vista de perfil: info personal (con avatar upload), datos de organización (solo HOST), cambio de contraseña con verificación |
| `apps/web-host/src/components/Sidebar.tsx` | Modificado | Orden del menú reorganizado: Asistentes → Usuarios → Escáner → Perfil |
| `apps/web-host/src/app/dashboard/page.tsx` | Modificado | Vista `'profile'` añadida al tipo union, import y render de `OrganizerProfile` |
| `apps/web-client/src/app/global.css` | Modificado | Fuente Anton importada; bloque CSS `.hero-split` completo (layout, headline, CTAs, imagen full-bleed, responsive) |
| `apps/web-client/src/app/page.tsx` | Modificado | Cálculo de `nextEvent` (próximo evento futuro publicado); Hero Section split con imagen full-bleed en panel derecho |

### Sesión del 17 de Mayo 2026 — Eventos Destacados, Admin Event CRUD, UI Cleanup

| Archivo | Tipo de Cambio | Descripción |
| :--- | :--- | :--- |
| `libs/shared/prisma/schema.prisma` | Modificado | Campos `isFeatured` (Boolean) y `featuredUntil` (DateTime?) en modelo `Event` |
| `apps/api/src/app/admin/admin.service.ts` | Modificado | Métodos `getAllEvents()` (con zones/seats) y `toggleEventFeatured()` |
| `apps/api/src/app/admin/admin.controller.ts` | Modificado | Endpoints `GET /admin/events` y `PATCH /admin/events/:id/featured` |
| `apps/web-admin/components/Sidebar.tsx` | Modificado | Nueva entrada "🌟 Eventos" en navegación lateral |
| `apps/web-admin/components/EditEventForm.tsx` | **Nuevo** | Copia del formulario de edición de eventos del web-host |
| `apps/web-admin/lib/api.ts` | Modificado | Funciones `getAllEventsAdmin()`, `setEventFeatured()`, `deleteEvent()` |
| `apps/web-admin/app/dashboard/page.tsx` | Modificado | Vista de eventos con tabs (Activos/Inactivos/Borrador), destacar, editar y eliminar |
| `apps/web-client/src/app/page.tsx` | Modificado | Eliminación de hero, stats, botones innecesarios. Limpieza general de UI |
| `apps/web-client/src/components/Navbar.tsx` | Modificado | Buscador colapsable integrado como icono lupa en el header |
| `apps/web-client/src/components/SearchBar.tsx` | Modificado | Componente de búsqueda adaptado para funcionar dentro del Navbar |
| `apps/web-client/src/components/EventCard.tsx` | Modificado | Eliminado botón "Ver Detalles" para reducir altura de tarjetas |
| `apps/web-host/src/components/CreateEventForm.tsx` | Modificado | Eliminado campo "Imagen del evento (General)" |
| `apps/web-host/src/components/EditEventForm.tsx` | Modificado | Eliminado campo "Imagen del evento (General)" |
| `start-all.bat` | **Nuevo** | Script batch para iniciar los 4 servicios en ventanas separadas |

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
- [x] ~~Sección de "Eventos Destacados" en la página principal del web-client~~ ✅ (20 May 2026)
- [x] ~~Automatización de expiración de destacados (cron job `@nestjs/schedule` cada hora)~~ ✅ (20 May 2026)
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
- [x] ~~Sistema de Eventos Destacados: modelo BD (isFeatured/featuredUntil), endpoints API, UI admin con toggle~~ ✅ (17 May 2026)
- [x] ~~Gestión Global de Eventos en Admin: vista con tabs Activos/Inactivos/Borrador~~ ✅ (17 May 2026)
- [x] ~~Edición de eventos por Admin Global (formulario completo idéntico al de organizadores)~~ ✅ (17 May 2026)
- [x] ~~Eliminación de eventos por Admin (con protección de tickets vendidos)~~ ✅ (17 May 2026)
- [x] ~~Limpieza de página principal web-client: eliminación de hero, stats, botones redundantes~~ ✅ (17 May 2026)
- [x] ~~Buscador colapsable integrado en Navbar (icono lupa → campo de texto)~~ ✅ (17 May 2026)
- [x] ~~Eliminación de campo "Imagen General" en formularios de evento (reemplazado por Imagen Cuadrada 1:1)~~ ✅ (17 May 2026)
- [x] ~~Página Usuarios en Panel Host: gestión de OrganizerMembers (ADMIN/STAFF), avatar, contraseña, estado~~ ✅ (17 May 2026)
- [x] ~~Página Perfil en Panel Host: info personal, org (solo HOST), cambio de contraseña con verificación~~ ✅ (18 May 2026)
- [x] ~~Ruta de avatar de miembros bajo directorio del organizador correspondiente~~ ✅ (18 May 2026)
- [x] ~~Hero Section en Web Client: split DICE.fm con fuente Anton, titular bold, CTA, imagen evento próximo full-bleed~~ ✅ (18 May 2026)
- [x] ~~Endpoints GET/PATCH /api/auth/me/organizer, /basic, /password, /organizer-profile para perfil de organizador/miembro~~ ✅ (18 May 2026)
- [x] ~~Carrusel Hero coverflow interactivo con 3 próximos eventos: circular motion (teleport doble rAF), auto-avance, dots, pausa hover~~ ✅ (19 May 2026)
- [x] ~~Aspecto 1:1 en tarjetas del carrusel (corregido de 2:3), contenedor transparente sin borde visible~~ ✅ (19 May 2026)
- [x] ~~Fade lateral en bordes del carrusel: gradiente var(--bg-primary)→transparent via ::before/::after~~ ✅ (19 May 2026)
- [x] ~~Reducción 10% del contenido izquierdo del hero (scale 0.9 transform-origin top left)~~ ✅ (19 May 2026)
- [x] ~~Equalización de espaciado: titular→subtítulo = subtítulo→botones (eliminado margin-bottom del headline)~~ ✅ (19 May 2026)
- [x] ~~Icono búsqueda SVG outlined (circle + line) en lugar de emoji 🔍 en SearchBar~~ ✅ (19 May 2026)
- [x] ~~Sección Eventos Destacados en web-client: condicional (solo si hay destacados activos), tarjetas 1:1 con badge dorado, eventos destacados excluidos del catálogo general~~ ✅ (20 May 2026)
- [x] ~~Cron job de expiración automática de destacados (`@nestjs/schedule`, cada hora, desactiva cuando `featuredUntil < now`)~~ ✅ (20 May 2026)
- [x] ~~Campo `portraitImageUrl` (3:4): schema Prisma, backend, formularios CreateEvent/EditEvent (web-host y web-admin), usado en carrusel hero~~ ✅ (20 May 2026)
- [x] ~~Carrusel hero usa `portraitImageUrl` (3:4) como imagen principal, aspect-ratio 3:4, posición vertical ajustada~~ ✅ (20 May 2026)
- [x] ~~EventCard general usa `squareImageUrl` (1:1), placeholder SVG oscuro cuando no hay imagen~~ ✅ (20 May 2026)
- [x] ~~Banner del evento: `aspect-ratio: 289/111` (exacto 2023×777px), `object-fit: contain`, `border-radius: 15px`, sin recorte~~ ✅ (20 May 2026)

---

## 9. 🐛 Bugs Conocidos / Deuda Técnica

- **Lint warnings `any`**: Múltiples archivos usan `any` type (especialmente `events.service.ts` y `EditEventForm.tsx`). Funcional pero debería tiparse mejor.
- **Console.log en create**: `events.service.ts` línea 10 tiene un `console.log` de debug que debería removerse.
- **NX Daemon**: No funciona, requiere rebuild manual del backend. Investigar fix o migrar a otro método de serve.
- **Galería de imágenes en edición**: Las imágenes de galería existentes se acumulan en vez de reemplazarse (al editar, se suman las nuevas a las anteriores).
