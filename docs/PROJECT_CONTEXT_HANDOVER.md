# PROJECT CONTEXT & HANDOVER: AfroEventos

**Última Actualización:** 30 de Mayo de 2026 (Sesión 8)
**Estado del Proyecto:** Fases 1-4 Completas + Portal Cliente completo + Panel Host completo + Panel Admin completo + Sistema de Emails Transaccionales completo + Auth flow (verify/forgot/reset password) + URLs `/eventos/` en español + Favicons AfroEventos + Sistema de Banners Publicitarios completo (full-stack) + UI/UX Portal Cliente (Destacados Adaptativos + FeaturedCarousel + EventsGrid con paginación real) + OrganizerCTA + Navbar dropdown + Galería de eventos rediseñada + sellOnSite en zonas (full-stack) + Bloqueo de Organizadores (full-stack) + Modales personalizados (sin confirm/alert nativo) + Persistencia de vista en URL + Impersonación de Organizadores por Admin + Control de Pasarela de Pagos (global + por organizador) + Límite de eventos por plan con conteo anual por aniversario + Paginación real en API + Sistema de imágenes optimizado (Sharp WebP + límites configurables desde .env) + **API en producción (Coolify)**
**Propósito:** Carga instantánea de contexto para modelos de IA o desarrolladores.

---

## 1. Visión del Proyecto

**AfroEventos** es un marketplace de venta y gestión de entradas para eventos de cultura afroecuatoriana. Sistema de dos lados (organizadores y asistentes), similar a `buenplan.com.ec`.

### Actores del Sistema

| Rol                    | Descripción                                                                                  | Interface          |
| :--------------------- | :------------------------------------------------------------------------------------------- | :----------------- |
| **Host (Organizador)** | Crea eventos, gestiona zonas/asientos, ve reportes, gestiona su equipo                       | Web Host (:4201)   |
| **User (Asistente)**   | Descubre eventos, compra tickets, recibe QR dinámicos, ve sus tickets                        | Web Client (:4200) |
| **Staff (Validador)**  | Escanea códigos QR en la puerta usando la App Móvil                                          | Mobile App (Expo)  |
| **Admin**              | Gestión global de la plataforma: organizadores, planes, eventos, usuarios del sistema        | Web Admin (:4202)  |

---

## 2. Stack Tecnológico

| Capa                | Tecnología                          | Detalle                                      |
| :------------------ | :---------------------------------- | :------------------------------------------- |
| **Monorepo**        | Nx (Integrated Repo)                | Gestión de workspace, builds y dev servers   |
| **Lenguaje**        | TypeScript                          | Modo estricto con decoradores experimentales |
| **Backend**         | NestJS (Node.js)                    | API RESTful en puerto 3000                   |
| **Frontend (User)** | Next.js 16 (App Router, Turbopack)  | Portal de usuario en puerto 4200             |
| **Frontend (Host)** | Next.js 16 (App Router, Turbopack)  | Dashboard de organizador en puerto 4201      |
| **Frontend (Admin)**| Next.js 16 (App Router, Turbopack)  | Dashboard de administrador en puerto 4202    |
| **Mobile**          | React Native (Expo)                 | App de validación QR para staff              |
| **Base de Datos**   | PostgreSQL 15                       | Containerizado en puerto 5435                |
| **Cache/Locks**     | Redis 7                             | Containerizado en puerto 6380                |
| **ORM**             | Prisma 5.22.0                       | Schema como fuente de verdad                 |
| **Infra**           | Docker Compose                      | PostgreSQL + Redis                           |
| **Pagos**           | Stripe (simulado)                   | Módulo mock, siempre aprueba                 |
| **Email**           | Nodemailer + @nestjs/mailer         | SMTP configurable (Gmail / Resend / cualquier SMTP) |
| **Scheduler**       | @nestjs/schedule                    | Cron job de expiración de eventos destacados |

---

## 3. Arquitectura Actual

### Estructura de Carpetas

```text
/
├── apps/
│   ├── api/                     # Port 3000. NestJS Backend.
│   │   └── src/app/
│   │       ├── auth/            # Login JWT, Registro, Guards, Verify/Reset Password
│   │       ├── events/          # CRUD de Eventos con Zonas, Asientos, Slugs
│   │       ├── orders/          # Lock de asientos, Compra, Tickets QR, Asistentes
│   │       ├── payments/        # Stripe simulado
│   │       ├── tickets/         # Validación de QR (VALID → USED), validate-by-id
│   │       ├── admin/           # Gestión global: orgs, planes, usuarios, eventos
│   │       ├── banners/         # BannersModule — CRUD banners publicitarios (público + admin)
│   │       ├── organizer-members/ # CRUD OrganizerMember (ADMIN/STAFF)
│   │       ├── mail/            # MailModule @Global() — 13 templates, 12 métodos
│   │       ├── scheduler/       # Cron job expiración eventos destacados (cada hora)
│   │       ├── upload/          # Multer disk storage, rutas dinámicas por tipo (+ banner)
│   │       ├── prisma/          # PrismaService
│   │       └── redis/           # RedisService (ioredis)
│   │
│   ├── web-client/              # Port 4200. Next.js Portal de Usuario.
│   │   └── src/
│   │       ├── app/
│   │       │   ├── eventos/[id]/    # Detalle de evento (ruta en español)
│   │       │   ├── my-tickets/      # Tickets del usuario con QR
│   │       │   ├── my-profile/      # Perfil: avatar, datos, ID, dirección Ecuador
│   │       │   ├── verify-email/    # Verificación de email con token
│   │       │   ├── forgot-password/ # Solicitar reset de contraseña
│   │       │   └── reset-password/  # Nueva contraseña con token
│   │       └── components/
│   │           ├── BannerSlider.tsx      # Slider/carrusel de banners publicitarios 16:3, auto-avance 5s
│           ├── FeaturedEventsSection.tsx # 3 layouts adaptativos según cantidad de destacados
│           ├── FeaturedCarousel.tsx  # Carrusel deslizante de tarjetas para 3+ destacados
│           ├── EventsGrid.tsx        # Grid con botón "Mostrar más" (paginación client-side)
│           ├── OrganizerCTA.tsx      # Sección CTA para organizadores (Server Component, neuromarketing)
│   │
│   ├── web-host/                # Port 4201. Next.js Dashboard Organizador.
│   │   └── src/app/
│   │       ├── forgot-password/ # Solicitar reset (panel host)
│   │       └── reset-password/  # Nueva contraseña (panel host)
│   │
│   ├── web-admin/               # Port 4202. Next.js Dashboard Admin.
│   │   └── app/
│   │       ├── dashboard/page.tsx # Dashboard principal — vista Banners con CRUD completo
│   │       ├── forgot-password/   # Solicitar reset (panel admin)
│   │       └── reset-password/    # Nueva contraseña (panel admin)
│   │
│   └── mobile-app/              # Expo App. Validador de QR para Staff.
│
├── libs/
│   ├── shared/                  # Librería compartida
│   │   ├── prisma/schema.prisma # Schema único de base de datos
│   │   └── src/lib/dto/         # DTOs compartidos (auth, events)
│   └── ui-kit/                  # Scaffolded (sin uso aún)
│
├── scripts/
│   └── seed-roles.js            # Script para asignar roles HOST/STAFF
│
├── docs/
│   ├── PROJECT_CONTEXT_HANDOVER.md  # Este archivo
│   └── CHECKPOINT_RESTORE.md        # Guía rápida de inicio + funcionalidades completas
│
├── docker-compose.yml           # PostgreSQL 15 + Redis 7
├── .env                         # Variables de entorno
├── start-all.bat                # Script para iniciar los 4 servicios
└── tsconfig.base.json           # Paths: @open-ticket/shared, @open-ticket/ui-kit
```

### Infraestructura (Docker)

| Servicio          | Puerto             | Credenciales                                  |
| :---------------- | :----------------- | :-------------------------------------------- |
| **PostgreSQL 15** | 5435 (no estándar) | `postgres` / `password` / DB: `openticket_db` |
| **Redis 7**       | 6380 (no estándar) | Sin password                                  |

### Variables de Entorno (`.env`)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5435/openticket_db?schema=public
REDIS_URL=redis://localhost:6380
JWT_SECRET=superSecretKey123
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:4200
NEXT_PUBLIC_HOST_URL=http://localhost:4201
NEXT_PUBLIC_ADMIN_URL=http://localhost:4202

# Email (SMTP — dejar vacío para modo silencioso)
MAIL_HOST=
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=
MAIL_PASS=
MAIL_FROM=AfroEventos <no-reply@afroeventos.com>

# Almacenamiento de imágenes (local = VPS | cloudinary = CDN)
STORAGE_PROVIDER=local
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Límites y formatos de imágenes (afectan backend + 3 frontends)
NEXT_PUBLIC_MAX_UPLOAD_MB=2.5
NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
UPLOAD_IMAGE_QUALITY=80
```

---

## 4. Schema de Base de Datos (Prisma)

```prisma
enum Role      { USER, HOST, ADMIN, EDITOR, STAFF }
enum EventStatus { DRAFT, PUBLISHED, CANCELLED, COMPLETED }
enum TicketStatus { VALID, USED, REFUNDED }
enum OrganizerStatus { PENDING, APPROVED, REJECTED, BLOCKED }
enum MemberRole { ADMIN, STAFF }

model User {
  id, email (unique), password (bcrypt), name, phone?
  role (default USER)
  // Auth
  emailVerified        Boolean   @default(true)  // false para nuevos registros web-client
  resetPasswordToken   String?   @unique
  resetPasswordExpires DateTime?
  // Perfil extendido
  avatarUrl?, idType?, idNumber?, address?, province?, city?, birthDate?, citizenship?
  → eventsOwned Event[], orders Order[], organizerProfile OrganizerProfile?
}

model OrganizerProfile {
  id, userId → User (unique)
  organizationName, organizationDescription?, organizationLogo?
  address?, province?, city?
  status OrganizerStatus (default PENDING)  // PENDING | APPROVED | REJECTED | BLOCKED
  planId → Plan?
  paidEventsEnabled Boolean?  // null = heredar global, true/false = override por organizador
  createdAt DateTime @default(now())
  → members OrganizerMember[]
}

model SystemConfig {
  id                String   @id @default("global")  // singleton row
  paidEventsEnabled Boolean  @default(false)          // toggle global de pasarela de pagos
  updatedAt         DateTime @updatedAt
}

model OrganizerMember {
  id, email (unique), password (bcrypt), name, phone?, avatarUrl?
  memberRole MemberRole (ADMIN | STAFF)
  isActive (default true)
  organizerProfileId → OrganizerProfile
}

model Plan {
  id, name, maxEvents (0 = ilimitado), price (Decimal)
  → organizers OrganizerProfile[]
}

model Banner {
  id, imageUrl, linkUrl?, title?
  isActive (default true), order (default 0)
  createdAt, updatedAt
}

model Event {
  id, slug? (unique), title, description?, date, location, city?, province?
  imageUrl?, bannerImageUrl?, squareImageUrl?, portraitImageUrl?
  status (default DRAFT)
  isFeatured (default false), featuredUntil?
  category?
  → organizer User, zones Zone[]
}

model Zone {
  id, eventId → Event, name, price (Decimal), capacity, isReservedSeating
  sellOnSite Boolean @default(false)   // si true: muestra aviso "en el lugar", no genera asientos
  description?
  → seats Seat[]
}

model Seat {
  id, zoneId → Zone, row?, number?, isSold (default false)
}

model Order {
  id, userId → User, totalAmount (Decimal), status, paymentRef?
  → tickets Ticket[]
}

model Ticket {
  id, orderId → Order, qrCodeToken (unique JWT), status (default VALID), scannedAt?
}
```

**Nota crítica**: El `Ticket` no tiene relación directa con `Seat` ni `Event`. La información del asiento y el `eventId` se codifican dentro del QR JWT y se decodifican en runtime para el endpoint `GET /orders` y para notificaciones de cambio de evento.

---

## 5. Sistema de Banners Publicitarios

### Arquitectura

Banners son imágenes publicitarias de relación de aspecto **16:3** que aparecen como slider en el Portal de Clientes (web-client), entre la sección de Eventos Destacados y la sección de Próximos Eventos. Se gestionan desde la vista **Banners Publicitarios** del Dashboard Global Admin (web-admin). El límite es de **1 a 3 banners activos**.

### Backend (`apps/api/src/app/banners/`)

| Archivo | Descripción |
| :--- | :--- |
| `banners.module.ts` | `BannersModule` — registrado en `AppModule` |
| `banners.service.ts` | `findAll()` (solo activos, público), `findAllAdmin()`, `create()`, `update()`, `remove()` |
| `banners.controller.ts` | Endpoints del controlador |

**Endpoints:**

| Método | Ruta | Auth | Descripción |
| :----- | :--- | :--- | :---------- |
| GET | `/api/banners` | No | Banners activos ordenados (público, para web-client) |
| GET | `/api/banners/admin` | JWT (ADMIN/EDITOR) | Todos los banners incluyendo inactivos |
| POST | `/api/banners` | JWT (ADMIN/EDITOR) | Crear banner |
| PATCH | `/api/banners/:id` | JWT (ADMIN/EDITOR) | Editar banner (imagen, título, link, estado, orden) |
| DELETE | `/api/banners/:id` | JWT (ADMIN/EDITOR) | Eliminar banner |
| POST | `/api/upload?type=banner` | Opcional | Subir imagen de banner → `./uploads/banners/` |

### Admin UI (`BannersView` en `apps/web-admin/app/dashboard/page.tsx`)

- Lista de banners con preview 16:3, badge de estado (Activo/Inactivo), enlace y posición
- Indicador visual de capacidad (barra de 3 segmentos: X/3 banners)
- Acciones por banner: Activar/Desactivar, Editar, Eliminar — cada una con estado de carga propio
- Modal de creación/edición: upload de imagen con preview en proporción 16:3, título, URL de destino, posición, checkbox "Publicar inmediatamente"
- Toast notifications (esquina superior derecha) para éxito/error de cada acción
- Estado de error de carga separado del empty state, con botón "Reintentar"
- Al cerrar sesión o perder token, la vista muestra error sin colapsar

### Web Client (`apps/web-client/`)

**`src/components/BannerSlider.tsx`**:
- Slider full-width, relación de aspecto `16/3` (CSS `aspect-ratio`)
- Auto-avance cada 5 segundos con `setInterval`
- Flechas prev/next visibles solo si hay más de 1 banner
- Puntos indicadores interactivos en la parte inferior
- Clic en banner redirige a `linkUrl` (target `_blank`) si existe
- Reinicia el timer al navegar manualmente
- Resuelve URLs relativas añadiendo `SERVER_URL` (sin `/api`)

**`src/app/page.tsx`**:
- Carga banners server-side con `getBanners()` (`.catch(() => [])` para no bloquear si falla)
- `<BannerSlider banners={banners} />` se renderiza solo en la página principal (sin búsqueda) y solo si hay banners
- Posición: **al final de la página principal, después del catálogo de eventos generales** (`<section id="eventos">`)

**`src/app/global.css`** — estilos del slider: `.banner-slider-section`, `.banner-slider-wrapper`, `.banner-slide-img`, `.banner-nav`, `.banner-dots`, `.banner-dot`

**`src/lib/api.ts`** — función añadida: `getBanners(): Promise<BannerItem[]>` y tipo `BannerItem`

**`lib/api.ts` (web-admin)** — funciones añadidas: `getBannersAdmin`, `createBanner`, `updateBanner`, `deleteBanner`, `uploadBannerImage`

### Directorio de uploads

```
uploads/
└── banners/          ← imágenes de banners publicitarios (uuid + extensión)
```

---

## 6. Módulo de Email (MailModule)

### Arquitectura

- `@Global()` + `MailModule` importado en `AppModule` — inyectable en todos los módulos sin importarlo explícitamente.
- Configuración SMTP desde variables de entorno (`MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`).
- Si `MAIL_HOST` está vacío, el transport se ignora y los emails fallan silenciosamente.
- Patrón fire-and-forget en todos los callers: `.catch(() => null)` — nunca bloquea el flujo del usuario.

### Métodos del MailService

| Método | Template | Descripción |
| :--- | :--- | :--- |
| `sendWelcomeUser(to, name)` | `welcome-user` | Bienvenida al portal de clientes |
| `sendWelcomeHost(to, name, orgName)` | `welcome-host` | Bienvenida al portal de organizadores |
| `sendEmailVerification(to, name, token)` | `verify-email` | Token de verificación de email |
| `sendPasswordReset(to, name, token)` | `reset-password` | Token de reset de contraseña |
| `sendPasswordChanged(to, name)` | `password-changed` | Confirmación de cambio de contraseña |
| `sendPurchaseConfirmation(to, buyerName, eventTitle, eventDate, eventLocation, tickets, totalAmount, orderId)` | `purchase-confirmation` | Confirmación de compra con todos los tickets |
| `sendHostApproved(to, name, orgName)` | `host-approved` | Aprobación del organizador |
| `sendHostRejected(to, name, orgName, reason?)` | `host-rejected` | Rechazo del organizador con motivo |
| `sendAccountCreatedByAdmin(to, name, email, password, role, orgName?)` | `account-created-by-admin` | Credenciales de cuenta creada por admin |
| `sendMemberInvitation(to, memberName, orgName, memberRole, email, password)` | `member-invitation` | Invitación a miembro con credenciales |
| `sendEventCanceled(to, buyerName, eventTitle, eventDate, eventLocation, eventCity, orderId)` | `event-canceled` | Aviso de cancelación a comprador |
| `sendEventRescheduled(to, buyerName, eventTitle, oldDate, newDate, newLocation, newCity)` | `event-rescheduled` | Aviso de reprogramación a comprador |

---

## 7. Flujos de Negocio Verificados

### Flujo de Compra (End-to-End)

```
Usuario selecciona asientos → POST /orders/lock-seats (Redis TTL 10min)
→ POST /orders/purchase → Stripe mock → Prisma transaction:
  [Seats marked sold + Order created + Tickets with QR JWT created]
→ Redis locks released
→ MailService.sendPurchaseConfirmation() .catch(() => null)
→ Response with tickets & QR tokens
```

### Flujo de Validación QR

```
Staff escanea QR → POST /tickets/validate (token JWT)
→ JWT decoded → Ticket found in DB → Status check:
  - VALID → Mark as USED, set scannedAt → "Acceso Permitido"
  - USED → "Este ticket YA FUE USADO anteriormente"

Alternativa: POST /tickets/validate-by-id { partialId: '#c288f2ae' }
→ Busca ticket por id.startsWith(partialId, insensible a #)
→ Misma lógica de validación
```

### Flujo de "Mis Tickets"

```
Usuario logueado → GET /orders (JWT)
→ Backend: Fetch orders + tickets → Decode cada QR JWT
→ Fetch event info (título, fecha, ubicación) desde DB
→ Response enriquecida con eventTitle, zoneName, seatNumber por ticket
```

### Flujo de Notificación de Cambio de Evento

```
Host edita evento → PATCH /events/:id
→ EventsService.update() detecta si status === CANCELLED o fecha/lugar cambiaron
→ Si hay cambio relevante: EventsService.notifyBuyersOfChange()
  → Carga todos los tickets con su order.user
  → Decodifica cada JWT con JwtService.verify()
  → Filtra tickets donde decoded.eventId === eventId
  → Deduplica por userId
  → Envía email event-canceled o event-rescheduled a cada comprador único
→ Todo fire-and-forget: .catch(() => null)
```

### Flujo de Verificación de Email

```
POST /auth/register
→ Crea User con emailVerified: false
→ Genera token JWT (24h) → guarda en resetPasswordToken
→ Envía verify-email con link: SITE_URL/verify-email?token=JWT
→ Usuario abre link → GET /auth/verify-email?token=JWT
→ Verifica JWT → emailVerified: true → limpia token
```

### Flujo de Reset de Contraseña

```
POST /auth/forgot-password { email }
→ Anti-enumeración: siempre responde "Si el email existe..."
→ Si existe: token JWT (1h) → resetPasswordToken + resetPasswordExpires
→ Envía reset-password con link correcto según dominio de origen:
  - SITE_URL/reset-password (web-client)
  - HOST_URL/reset-password (web-host)
  - ADMIN_URL/reset-password (web-admin)

POST /auth/reset-password { token, newPassword }
→ Verifica JWT + compara token + verifica no expirado
→ bcrypt.hash(newPassword) → actualiza password → limpia token/expires
```

---

## 8. Datos de Prueba

| Rol                 | Email                      | Password       | Dónde usarlo        |
| :------------------ | :------------------------- | :------------- | :------------------ |
| Admin Global        | `admin@admin.com`          | `admin123`     | `:4202` (web-admin) |
| Host (Organizador)  | `admin@openticket.com`     | (restablecer)  | `:4201` (web-host)  |
| Host (Organizador)  | `grouphackingx@gmail.com`  | (restablecer)  | `:4201` (web-host)  |
| Cliente             | `dmxwilly@gmail.com`       | `willy2024`    | `:4200` (web-client)|
| Cliente             | `cliente@openticket.com`   | `cliente123`   | `:4200` (web-client)|
| Staff (Validador)   | `staff@openticket.com`     | `staff123`     | Mobile App          |

---

## 9. Guía Operativa (Cómo Iniciar)

```powershell
# 1. Infraestructura
docker-compose up -d

# 2. Prisma (solo primera vez o tras cambios de schema)
npx prisma generate --schema=libs/shared/prisma/schema.prisma
npx prisma db push --schema=libs/shared/prisma/schema.prisma

# 3. API (Terminal 1) — hot-reload activo
npx nx serve api --no-dte

# 4. Web Client (Terminal 2)
cd apps/web-client && npx next dev --port=4200

# 5. Web Host (Terminal 3)
cd apps/web-host && npx next dev --port=4201

# 6. Web Admin (Terminal 4)
cd apps/web-admin && npx next dev --port=4202

# Alternativa: script todo-en-uno
start-all.bat
```

---

## 10. Roadmap

### Prioridad Alta

- [ ] Integración real con Stripe
- [ ] Reportes financieros para organizadores
- [x] ~~Paginación en endpoints~~ ✅ (28 May 2026)
- [x] ~~Deploy API en producción~~ ✅ (30 May 2026) → `https://api.afroeventos.com/api`
- [ ] Deploy frontends en producción (web-client, web-host, web-admin)

### Prioridad Media

- [ ] Sistema de categorías de eventos
- [ ] Optimizar queries de findAll (sin traer todos los seats)
- [ ] CDN para imágenes

### Prioridad Baja

- [ ] Websockets para mapa de asientos en tiempo real
- [ ] Rate limiting en API
- [ ] CI/CD pipeline
- [ ] Tests unitarios e integración

---

## 11. Problemas Conocidos / Notas Técnicas

- **Puertos no estándar**: PostgreSQL en 5435, Redis en 6380.
- **Prisma 5.22.0**: Versión bloqueada por incompatibilidades de CLI con v7+.
- **Pagos simulados**: El módulo `PaymentsService` siempre retorna `true`.
- **Ticket sin relación a Seat**: El modelo `Ticket` no tiene `seatId`. La info del asiento se codifica en el QR JWT.
- **eventId no en Ticket DB**: Para notificar compradores de un evento hay que decodificar todos los JWT de tickets — costoso con muchos tickets. Mejora futura: agregar `eventId` al modelo `Order`.
- **ValidationPipe Global**: `main.ts` tiene `whitelist: true`. PATCH de eventos usa `@Request()` para evitar filtrado de campos de zona.
- **NX Daemon**: Activo con `useDaemonProcess: true` y `watch: true` en `project.json`. Hot-reload automático.
- **Emails vacíos**: Si `MAIL_HOST` está vacío en `.env`, los emails fallan silenciosamente (no bloquean el flujo).
- **Anti-enumeración**: `forgot-password` y `resend-verification` siempre retornan 200 con el mismo mensaje.
- **Galería de imágenes**: Al editar un evento, las imágenes de galería se acumulan (no se reemplazan las anteriores).

---

## 12. Registro de Cambios

### Sesión del 25 de Mayo de 2026 (Sesión 5) — Bloqueo de Organizadores + Modales Personalizados + Persistencia URL + Impersonación Admin

#### Bloqueo de Organizadores — Full-Stack

**Motivación**: El administrador necesita poder suspender inmediatamente la cuenta de un organizador, terminando su sesión activa al instante sin esperar a que el JWT expire.

**`libs/shared/prisma/schema.prisma`** — `BLOCKED` añadido al enum `HostStatus`:
```prisma
enum HostStatus { PENDING, APPROVED, REJECTED, BLOCKED }
```
`npx prisma db push` + `npx prisma generate` ejecutados (API detenida durante generación).

**`apps/api/src/app/auth/auth.service.ts`** — Check en `login()`:
```typescript
if (user.role === 'HOST' && user.organizerProfile?.status === 'BLOCKED') {
    throw new UnauthorizedException('Tu cuenta ha sido suspendida...');
}
```

**`apps/api/src/app/auth/strategies/jwt.strategy.ts`** — Check en cada request autenticado:
- Inyecta `PrismaService`
- Si `payload.role === 'HOST' && !payload.isMember`: consulta `organizerProfile.status` en BD
- Si `status === 'BLOCKED'` → lanza `UnauthorizedException('ACCOUNT_BLOCKED')`
- Esto fuerza el cierre de sesión en tiempo real (sin esperar a que el JWT expire)

**`apps/api/src/app/auth/auth.module.ts`** — `PrismaService` añadido a `providers`.

**`apps/web-host/src/lib/api.ts`** — Interceptor 401 en `fetchAPI()`:
```typescript
if (res.status === 401 && token && typeof window !== 'undefined') {
    localStorage.removeItem('ot_host_token');
    localStorage.removeItem('ot_host_user');
    window.location.href = '/login';
    return {} as T;
}
```

**`apps/web-admin/app/dashboard/page.tsx`** — Handler `handleBlockOrg` + botón 🔒/🔓 en la tabla de organizadores:
- 🔒 (naranja) para bloquear → cambia status a `BLOCKED`
- 🔓 (verde) para desbloquear → cambia status a `APPROVED`
- Solo visible para usuarios con `role === 'ADMIN'` (no EDITOR)
- Nuevo stat card "Bloqueados" (naranja) en el panel de estadísticas

---

#### Modales Personalizados — Sin confirm/alert/prompt Nativos

**`apps/web-host/src/components/UIHelpers.tsx`** *(nuevo)*:
- `ConfirmModal` — modal de confirmación con `createPortal`, backdrop blur, botón de confirm con variante `danger`/`warning`/`default`
- `ToastStack` — stack de notificaciones (esquina inferior derecha), auto-cierre 3.5s, apilables
- `useConfirm()` → hook: `{ showConfirm(title, msg, onConfirm, variant), modalNode }`
- `useToast()` → hook: `{ showToast(msg, type), toastNode }`

**`apps/web-host/src/app/global.css`** — `@keyframes slideInRight` para animación de toasts.

**`apps/web-host/src/app/dashboard/page.tsx`** — Reemplazados `window.confirm` / `alert` en `handleDelete` con `showConfirm` / `showToast`.

**`apps/web-host/src/components/OrganizerUsers.tsx`** — Ídem en `handleDelete`.

**`apps/web-host/src/app/register/page.tsx`** — `alert(err.message)` en `handleLogoUpload` reemplazado por `setError(err.message)`.

**`apps/web-admin/app/dashboard/page.tsx`** — Componentes `ConfirmModal`, `InputModal` y `ToastStack` integrados inline (no como archivo separado). Todos los `confirm()`, `alert()`, `window.prompt()` del panel admin reemplazados por modales personalizados.

**`apps/web-admin/app/global.css`** — `@keyframes slideInRight` añadido.

---

#### Persistencia de Vista en URL

**`apps/web-admin/app/dashboard/page.tsx`**:
- `ViewType` + `VALID_VIEWS` array para validación de vistas
- `useSearchParams()` lee la vista inicial desde `?view=X`
- `setView(v)` wrapper: actualiza estado React + `router.replace('/dashboard?view=${v}', { scroll: false })`
- Al recargar la página, la vista activa se restaura desde la URL
- `export default function AdminDashboardWrapper() { return <Suspense><AdminDashboard /></Suspense>; }` — Suspense boundary requerido para `useSearchParams` en Next.js

**`apps/web-host/src/app/dashboard/page.tsx`**:
- Mismo patrón: `View` type + `VALID_VIEWS` + `setView` con `router.replace`
- `export default function DashboardPageWrapper() { return <Suspense><DashboardPage /></Suspense>; }`

**`apps/web-admin/app/reset-password/page.tsx`** y **`apps/web-host/src/app/reset-password/page.tsx`** — Mismo Suspense wrapper para `useSearchParams`.

---

#### Impersonación de Organizadores por Admin ("Acceder como Organizador")

**Motivación**: El administrador global necesita poder navegar el panel de un organizador como si fuera ese organizador (para soporte, diagnóstico, revisión), sin conocer ni cambiar su contraseña.

**Flujo**:
```
Admin hace clic en 👁 (solo para organizadores APPROVED)
  → POST /api/admin/organizers/:id/impersonate (solo ADMIN)
  → Backend genera JWT de 1h con identidad del HOST + campo impersonatedBy: adminId
  → window.open('localhost:4201/auth/impersonate?token=XXX', '_blank')

Nueva pestaña web-host en /auth/impersonate
  → Decodifica JWT (solo payload, sin verificar firma en frontend)
  → Valida que tenga campo impersonatedBy
  → loginUser(token, { ...usuario, organizerProfile: { status: 'APPROVED' }, impersonatedBy })
  → router.replace('/dashboard?view=dashboard')

Dashboard web-host
  → ImpersonationBanner detecta user.impersonatedBy → muestra banner morado fijo
  → Todas las acciones del panel funcionan con el JWT del organizador
  → JwtStrategy.validate() verifica BLOCKED en cada request (seguridad intacta)
  → Clic "Salir" → logout() → /login → cierra sesión de impersonación
```

**Backend** (`apps/api/src/app/admin/`):

- **`admin.module.ts`** — `JwtModule.register({ secret, signOptions: { expiresIn: '1h' } })` añadido a `imports`
- **`admin.service.ts`** — Nuevo método `impersonateOrganizer(targetUserId, adminId)`: valida que el organizador exista y esté APPROVED, genera JWT de 1h con payload HOST + `impersonatedBy`
- **`admin.controller.ts`** — Nuevo endpoint `@Post('organizers/:id/impersonate')`: hereda `@Roles(Role.ADMIN)` del controlador; solo accesible por ADMIN

**Frontend Admin** (`apps/web-admin/`):

- **`lib/api.ts`** — Nueva función `impersonateOrganizer(id, token)`
- **`app/dashboard/page.tsx`** — Handler `handleImpersonate` + botón 👁 (índigo) por organizador APPROVED; condición `user?.role === 'ADMIN'`

**Frontend Web-Host** (`apps/web-host/src/`):

- **`lib/AuthContext.tsx`** — `User` interface extendida con `impersonatedBy?: string`; `isImpersonating: boolean` derivado de `!!user?.impersonatedBy`; añadido al contexto y al valor del Provider
- **`app/layout.tsx`** — `<ImpersonationBanner />` añadido dentro de `<AuthProvider>` antes de `{children}`
- **`app/auth/impersonate/page.tsx`** *(nuevo)* — Decodifica token, llama `loginUser` con `organizerProfile: { status: 'APPROVED' }` y `impersonatedBy`, redirige a `/dashboard`. Usa `useRef(done)` para evitar doble ejecución por React Strict Mode
- **`components/ImpersonationBanner.tsx`** *(nuevo)* — Banner morado fijo (`position: fixed, top: 0, zIndex: 9999`): texto "👁 Modo Vista Admin — Navegando como [nombre]", botón "Salir"

**Bug corregido (React Strict Mode)**: En desarrollo, React ejecuta `useEffect` dos veces. En la segunda ejecución, la URL ya era `/dashboard` y `token` era `null`, lo que causaba `router.replace('/login')`. Fix: `useRef(done)` hace que el efecto sea idempotente.

---

#### Ajustes UX Web-Host Sidebar

- Badge "HOST" → **"Organizador"** (`Sidebar.tsx` línea `logo-badge`)
- Logo `AfroEventosLogo` reducido de `height={50}` → `height={45}` para evitar desbordamiento del badge

---

### Sesión del 25 de Mayo de 2026 (Tarde/Sesión 4) — OrganizerCTA + Navbar Dropdown + Galería Rediseñada + sellOnSite en Zonas + UX Web-Host

#### OrganizerCTA — nuevo componente (`apps/web-client/src/components/OrganizerCTA.tsx`)

Server Component (sin `'use client'`). Sección CTA al final del homepage, visible solo sin búsqueda activa. Diseño split 2 columnas:
- **Izquierda**: Eyebrow tag, headline en Anton (`¿Organizas eventos? Publica gratis.`), subtexto, botón CTA primario → `NEXT_PUBLIC_HOST_URL/register`, punto pulsante animado de social proof.
- **Derecha** (oculta en móvil): Mock de dashboard CSS con stats, fila de evento y barra de progreso.

Técnicas de neuromarketing aplicadas: loss aversion ("NO TE ENCUENTRA"), identidad colectiva ("música afro, bomba, marimba, Ecuador"), reciprocidad ("Completamente gratis — siempre"), simplicidad ("en minutos, sin tecnicismos").

**`apps/web-client/src/app/page.tsx`** — import + `{!query && <OrganizerCTA />}` después del BannerSlider.

**`apps/web-client/src/app/global.css`** — bloque `.octa-*` añadido al final: `.octa-section`, `.octa-inner` (grid 2 col), `.octa-headline` (Anton, `clamp(2.6rem, 4.5vw, 4.4rem)`), `.octa-accent` (verde), `.octa-mock` (mock dashboard), `.octa-proof-dot` (animación pulse). Responsive: 1 columna en ≤768px, mock oculto en móvil.

---

#### Navbar Dropdown (`apps/web-client/src/components/Navbar.tsx`)

El nombre de usuario ahora reemplaza al botón "Mi Perfil" con un dropdown:
- Botón `👤 {user.name} ▾` con chevron animado al abrir/cerrar
- Dropdown: "Mi Perfil" (Link a `/my-profile`) + divider + "Salir" (rojo)
- Cierre automático al hacer clic fuera (via `useRef` + `mousedown` listener)
- CSS nuevo en `global.css`: `.nav-profile-menu`, `.nav-profile-btn`, `.nav-profile-chevron`, `.nav-profile-dropdown`, `.nav-profile-dropdown-item`, `.nav-profile-dropdown-divider`, `.nav-profile-dropdown-item--danger`

---

#### Web-Host Login (`apps/web-host/src/app/login/page.tsx`)

- Título `<h1>Host</h1>` → `<h1>Organizador</h1>`
- Eliminado `<p>Panel de Organizador de Eventos</p>` (subtítulo)
- Logo envuelto en `<a href={NEXT_PUBLIC_SITE_URL}>` → clic en logo lleva al Portal de Clientes (:4200)

---

#### Zonas de Upload — Proporciones Visuales (Web Host)

**`apps/web-host/src/app/global.css`**:
- Eliminado `height: 200px` de `.file-label` (era fijo para todos los uploads)
- Nuevas clases con `aspect-ratio`: `.file-label--banner { aspect-ratio: 2000/576 }`, `.file-label--square { aspect-ratio: 1/1 }`, `.file-label--portrait { aspect-ratio: 3/4 }`
- Nueva clase `.image-upload-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }` — cuadrada y retrato lado a lado
- `input::-webkit-calendar-picker-indicator { filter: invert(1); }` — icono de calendario blanco

**`apps/web-host/src/components/CreateEventForm.tsx`** y **`EditEventForm.tsx`**:
- Banner label: `className="file-label file-label--banner"`, texto actualizado con "Relación 126:36"
- Cuadrada + retrato: envueltas en `<div className="image-upload-pair">`
- Cuadrada: `file-label--square`, retrato: `file-label--portrait`

---

#### Footer Tagline (`apps/web-client/src/components/Footer.tsx`)

Tagline cambiado a: _"La plataforma de eventos más moderna. Encuentra a donde ir, comprar entradas y disfrutar."_

---

#### Galería de Eventos Rediseñada (`apps/web-client/src/app/eventos/[id]/EventDetailClient.tsx`)

Nuevo componente `EventGallery({ urls })`:
- **1 imagen**: muestra completa, sin controles, sin fondo, sin borde
- **2+ imágenes**: galería con imagen principal (`evg-main`) + strip de thumbnails (`evg-thumbs`), flechas prev/next superpuestas, contador de posición, thumbnails clickeables con borde verde al estar activo
- Se adapta a cualquier relación de aspecto (sin `height` fijo — usa `height: auto`)
- Fondo e borde del contenedor principal: transparentes (`background: transparent; border: none`)

CSS nuevo en `global.css`: `.evg-section`, `.evg-title`, `.evg-main` (position relative), `.evg-main-img` (max-height: 600px, object-fit: contain), `.evg-arrow`, `.evg-arrow--prev/next`, `.evg-counter`, `.evg-thumbs`, `.evg-thumb`, `.evg-thumb--active { border-color: var(--color-primary) }`

---

#### sellOnSite en Zonas — Full-Stack

Nueva opción por zona para indicar que las entradas se venden presencialmente.

**`libs/shared/prisma/schema.prisma`** — `sellOnSite Boolean @default(false)` añadido al modelo `Zone`. `npx prisma db push` ejecutado.

**`libs/shared/src/lib/dto/events.dto.ts`** — `@IsBoolean() @IsOptional() sellOnSite?: boolean` en `CreateZoneDto`. `capacity` cambiado a `@Min(0)` (permite 0 para zonas sellOnSite).

**`apps/api/src/app/events/events.service.ts`** — `create()` y `update()`:
- Guarda `sellOnSite`, fuerza `price: 0 / capacity: 0` cuando es true
- No crea `seats` cuando `sellOnSite: true` (spread condicional)

**`apps/web-client/src/lib/api.ts`** — `sellOnSite?: boolean` añadido a la interfaz `Zone`.

**`apps/web-host/src/components/CreateEventForm.tsx`** y **`EditEventForm.tsx`**:
- `sellOnSite?: boolean` en interface `ZoneInput`
- Checkbox en cada zona: "Entradas disponibles en el lugar y día del evento"
- Al activar: oculta los inputs de precio y capacidad (renderizado condicional con `!zone.sellOnSite`)
- En EditForm: checkbox deshabilitado si la zona ya tiene ventas (`zone.hasSold`)
- Payload incluye `sellOnSite` y normaliza `price/capacity` a 0 si es true

**`apps/web-client/src/app/eventos/[id]/EventDetailClient.tsx`**:
- Zonas con `sellOnSite: true` renderizan un bloque especial con píldora verde: "🎟️ Entradas disponibles en el lugar y día del evento"
- No se muestra precio, ni selector de asientos, ni contador de disponibles
- `allZonesFree` actualizado: `z.sellOnSite` también cuenta como "sin compra online"

---

#### UX Web-Host — Valores por Defecto en Creación de Eventos

**`apps/web-host/src/components/CreateEventForm.tsx`**:
- Tipo de localidad por defecto: `"Entradas"` (antes: "Asientos Numerados") — `useState(false)` en `hasSeatingChart`
- Orden de botones: `🎫 Entradas` a la izquierda, `🪑 Asientos Numerados` a la derecha (ambos formularios)
- Precio por defecto de zona: `0` (antes: `25`)
- Capacidad por defecto de zona: `0` (antes: `50` / `10` al agregar)

---

### Sesión del 25 de Mayo de 2026 — UI/UX Portal Cliente: Destacados Adaptativos + Carrusel + Grid con Paginación

#### FeaturedEventsSection — 3 layouts adaptativos (`apps/web-client/src/components/FeaturedEventsSection.tsx`)

La sección de eventos destacados ahora usa un layout diferente según la cantidad de eventos:

| Cantidad | Layout | Imagen usada | Componente CSS |
| :------- | :----- | :----------- | :------------- |
| 1 evento | Tarjeta horizontal full-width (imagen 60% izquierda, info 40% derecha) | `bannerImageUrl` → `squareImageUrl` → `imageUrl` | `.featured-card-h` |
| 2 eventos | Dos columnas side-by-side, imagen panorámica arriba, info abajo | `bannerImageUrl` → `squareImageUrl` → `imageUrl`, `aspect-ratio: 2000/576` | `.featured-two-grid` + `.featured-card-v` |
| 3+ eventos | `FeaturedCarousel` (carrusel deslizante de tarjetas) | `squareImageUrl` → `imageUrl` → `bannerImageUrl`, `aspect-ratio: 1/1` | Ver sección siguiente |

**Eliminado de tarjetas destacadas**: etiqueta de categoría (`FIESTAS Y BAILES`), botón "Ver evento →", zoom de imagen en hover, efecto lift (translateY) en hover.

#### FeaturedCarousel — nuevo componente (`apps/web-client/src/components/FeaturedCarousel.tsx`)

Carrusel de tarjetas deslizantes para 3+ eventos destacados. `'use client'`.

- Muestra **3 tarjetas simultáneamente** usando flexbox + translateX
- **Scroll infinito**: clona los últimos 3 items al inicio y los primeros 3 al final del track; al llegar a clon, hace jump sin animación al original
- **Auto-avance** cada 4.5s, se pausa al hover
- **Flechas ‹ ›** posicionadas fuera del `.fcarousel-viewport` (`left: -1.25rem` / `right: -1.25rem`) para no tapar las tarjetas
- **Dots indicadores** dorados centrados debajo; activo se expande como píldora
- Cada tarjeta: imagen cuadrada 1:1 en la parte superior + título + meta (fecha, hora, lugar)

**Cálculo de translateX (corrección crítica)**: `translateX` opera en % del propio elemento (track). Fórmula correcta: `translateX(-${trackIndex * (100 / cloned.length)}%)`. Usar `100 / VISIBLE` en lugar de `100 / cloned.length` desplaza el track fuera de pantalla.

#### EventsGrid — nuevo componente (`apps/web-client/src/components/EventsGrid.tsx`)

Reemplaza el grid inline de `page.tsx`. `'use client'`.

- Muestra **3 eventos inicialmente** (`PAGE_SIZE = 3`)
- Botón **"Mostrar más ↓"** centrado debajo — agrega 3 eventos por clic con `setVisible(prev => prev + PAGE_SIZE)`
- Botón desaparece automáticamente cuando `visible >= events.length`
- Grid usa `display: flex; flex-wrap: wrap; justify-content: center` + `flex: 0 0 calc(33.333% - 1rem)` por tarjeta para centrar la última fila incompleta

#### Lógica header "Próximos Eventos" (`apps/web-client/src/app/page.tsx`)

| Escenario | Comportamiento |
| :-------- | :------------- |
| Solo eventos destacados (sin generales) | Header aparece **encima** de `<FeaturedEventsSection>` con clase `.upcoming-header-standalone` |
| Con eventos generales | Header aparece encima del grid general (dentro de `<section id="eventos">`) |
| Sin ningún evento | Header no aparece |

El atributo `id="eventos"` (ancla del botón "Explorar Eventos" del hero) se asigna dinámicamente: al div padre de FeaturedEventsSection cuando no hay generales, o al `<section>` del catálogo cuando los hay.

#### CSS nuevo (`apps/web-client/src/app/global.css`)

| Clase(s) | Descripción |
| :------- | :---------- |
| `.fcarousel`, `.fcarousel-viewport`, `.fcarousel-track` | Contenedor y track deslizante del carrusel |
| `.fcarousel-card-wrap`, `.fcarousel-card` | Tarjeta individual del carrusel |
| `.fcarousel-img`, `.fcarousel-body`, `.fcarousel-title`, `.fcarousel-meta` | Partes de la tarjeta (imagen 1:1, info) |
| `.fcarousel-arrow`, `.fcarousel-arrow-prev/next` | Flechas de navegación |
| `.fcarousel-dots`, `.fcarousel-dot` | Indicadores de posición |
| `.show-more-wrapper`, `.show-more-btn`, `.show-more-icon` | Botón "Mostrar más" del EventsGrid |
| `.upcoming-header-standalone` | Header "Próximos Eventos" cuando aparece sobre destacados |
| `.events-grid` (modificado) | Cambiado de CSS Grid a Flexbox para centrar última fila |
| `.featured-two-grid`, `.featured-card-v`, `.featured-card-v-img`, `.featured-card-v-body` | Layout de 2 eventos side-by-side |

---

### Sesión del 24 de Mayo de 2026 (Tarde) — Favicons + Banners Publicitarios full-stack

#### Favicons AfroEventos (las 3 apps)

- `apps/web-client/public/favicon.svg` — AfroFavicon.svg oficial (ícono verde, sin texto)
- `apps/web-host/public/favicon.svg` — ídem
- `apps/web-admin/public/favicon.svg` — ídem
- `apps/web-client/src/app/layout.tsx` — `icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' }` en metadata
- `apps/web-admin/app/layout.tsx` — ídem
- `apps/web-host/src/app/layout.tsx` — `'use client'` → no puede exportar metadata → usa `<head><link rel="icon" ...></head>` directamente en JSX

#### Dashboard Global Admin — Sidebar "Banners Publicitarios"

- `apps/web-admin/components/Sidebar.tsx` — nuevo ítem `📢 Banners Publicitarios` entre Eventos y Planes; resalta con `#8b5cf6` cuando está activo
- `apps/web-admin/app/dashboard/page.tsx` — `view` union type ampliado con `'banners'`; `{view === 'banners' && <BannersView token={token} />}` insertado dentro de `div.main-content`

#### Sistema de Banners Publicitarios — Backend

**`libs/shared/prisma/schema.prisma`** — nuevo modelo:
```prisma
model Banner {
  id, imageUrl, linkUrl?, title?
  isActive Boolean @default(true), order Int @default(0)
  createdAt, updatedAt
}
```
`npx prisma db push` ejecutado exitosamente.

**`apps/api/src/app/upload/upload.controller.ts`** — nuevo tipo `banner`:
- `destination`: `type === 'banner'` → `./uploads/banners/`
- `pathPart`: `type === 'banner'` → `/banners`

**`apps/api/src/app/banners/`** — módulo nuevo completo:
- `banners.service.ts`: `findAll()` (activos, público), `findAllAdmin()` (todos), `create()`, `update()`, `remove()`
- `banners.controller.ts`: `GET /banners` (público), `GET /banners/admin`, `POST /banners`, `PATCH /banners/:id`, `DELETE /banners/:id` — todos excepto el GET público requieren JWT (ADMIN/EDITOR)
- `banners.module.ts`: registrado en `AppModule`

**`apps/api/src/app/app.module.ts`** — `BannersModule` importado y registrado.

**Build API**: `npx nx build api --skip-nx-cache` → ✅ `webpack compiled successfully`

#### Sistema de Banners Publicitarios — Admin UI

**`apps/web-admin/lib/api.ts`** — funciones nuevas:
- `getBannersAdmin(token)`, `createBanner(data, token)`, `updateBanner(id, data, token)`, `deleteBanner(id, token)`, `uploadBannerImage(file, token)`
- Tipo exportado: `Banner`

**`BannersView` en `apps/web-admin/app/dashboard/page.tsx`** — componente completo:
- Estado de **carga separado** (skeleton) del estado de error y del empty state
- **Error de carga**: estado dedicado con ícono, mensaje amigable y botón "Reintentar" (nunca se superpone con el empty state)
- **Empty state** con CTA "Crear primer banner"
- **Lista de banners**: preview 16:3, badge Activo/Inactivo, enlace, posición
- **Indicador de capacidad**: barra visual de 3 segmentos + texto "X / 3 banners"
- **Acciones por banner**: Activar/Desactivar, Editar, Eliminar — cada botón muestra "..." durante la operación (previene doble clic)
- **Modal crear/editar**: upload con preview en ratio 16:3, cierra al hacer clic fuera, botón guardar deshabilitado si no hay imagen
- **Toast notifications** en esquina superior derecha: ✓ éxito / ⚠ error, auto-cierre en 3.5s
- Banners inactivos se muestran con opacidad reducida para indicación visual

#### Sistema de Banners Publicitarios — Web Client

**`apps/web-client/src/lib/api.ts`** — funciones/tipos nuevos:
- `getBanners(): Promise<BannerItem[]>` — GET `/banners` público, sin cache
- Tipo `BannerItem { id, imageUrl, linkUrl?, title?, isActive, order }`

**`apps/web-client/src/components/BannerSlider.tsx`** — nuevo componente:
- Full-width, `aspect-ratio: 16/3` vía CSS
- Auto-avance cada 5 segundos (setInterval, se resetea al navegar manualmente)
- Flechas prev/next solo si hay más de 1 banner
- Puntos indicadores interactivos
- Clic en banner → redirige a `linkUrl` en nueva pestaña si existe
- Resuelve URLs: si empieza con `http` la usa tal cual; si es ruta (`/uploads/...`) prepende `SERVER_URL`

**`apps/web-client/src/app/page.tsx`** — modificado:
- Importa `getBanners`, `BannerItem`, `BannerSlider`
- `banners` cargado server-side con `.catch(() => [])` (no bloquea si la API falla)
- `<BannerSlider banners={banners} />` insertado entre `<FeaturedEventsSection>` y `<section id="eventos">`, solo en página principal (no en búsqueda) y solo si hay banners

**`apps/web-client/src/app/global.css`** — estilos añadidos al final: `.banner-slider-section`, `.banner-slider-wrapper`, `.banner-slider-track`, `.banner-slide-link`, `.banner-slide-img`, `.banner-nav`, `.banner-nav-prev/next`, `.banner-dots`, `.banner-dot`, `.banner-dot.active`

---

### Sesión del 24 de Mayo de 2026 (Mañana) — Emails Transaccionales + Auth Flow + URL /eventos/

#### Sistema de Emails Transaccionales (Backend)

**`apps/api/src/app/mail/mail.service.ts`** — Añadidos 5 métodos nuevos:
- `sendPasswordChanged(to, name)` — confirmación de cambio de contraseña con alerta "¿No fuiste tú?"
- `sendEventCanceled(to, buyerName, ...)` — aviso de cancelación a compradores del evento
- `sendEventRescheduled(to, buyerName, ...)` — aviso de reprogramación con comparación anterior vs. nueva
- `sendMemberInvitation(to, memberName, orgName, role, email, password)` — invitación con credenciales
- `sendAccountCreatedByAdmin(to, name, email, password, role, orgName?)` — credenciales para HOST/ADMIN/EDITOR

**Templates nuevos** (`apps/api/src/app/mail/templates/`):
- `password-changed.template.ts` — timestamp, alerta roja con link reset, tips de seguridad
- `event-canceled.template.ts` — tema rojo urgente, detalle del evento, info de reembolso amber
- `event-rescheduled.template.ts` — tema amber, tabla comparativa fecha/lugar, aviso "tickets siguen válidos"
- `member-invitation.template.ts` — badge de rol (ADMIN/STAFF), credenciales en monoespaciado, tips seguridad
- `account-created-by-admin.template.ts` — ícono por rol (HOST/ADMIN/EDITOR), credenciales, URL del panel correcto

**`apps/api/src/app/auth/auth.service.ts`** — Modificado:
- Después de `changePassword()`: envía `sendPasswordChanged()` (busca en User o OrganizerMember según `isMember`)

**`apps/api/src/app/admin/admin.service.ts`** — Modificado:
- `createOrganizer()`: captura `rawPassword` antes del `bcrypt.hash()` → envía `sendAccountCreatedByAdmin()` con role HOST
- `createAdminUser()`: ídem con role ADMIN/EDITOR → URL del panel admin

**`apps/api/src/app/organizer-members/organizer-members.service.ts`** — Modificado:
- Añadido `MailService` en constructor
- Después de `createMember()`: envía `sendMemberInvitation()` con credenciales en claro

**`apps/api/src/app/events/events.service.ts`** — Modificado:
- Añadidos `MailService` y `JwtService` en constructor
- Nuevo método privado `notifyBuyersOfChange(eventId, type, ...)`:
  - Carga todos los tickets → decodifica JWT → filtra por `eventId` → deduplicación por userId
  - Envía `sendEventCanceled` o `sendEventRescheduled` según `type`
- En `update()`: detecta cambios de status/fecha/lugar antes del bloque de zonas → dispara notificación

**`apps/api/src/app/events/events.module.ts`** — Modificado:
- Añadido `JwtModule` en `imports` para poder inyectar `JwtService` en `EventsService`

**`apps/api/src/app/orders/orders.service.ts`** — Modificado:
- Después de `purchase()`: envía `sendPurchaseConfirmation()` con resumen completo de la compra

#### Auth Flow — Verificación y Reset (Backend)

**Schema Prisma** (`libs/shared/prisma/schema.prisma`) — Añadidos a `User`:
- `emailVerified Boolean @default(true)` (true grandfathers usuarios existentes)
- `resetPasswordToken String? @unique`
- `resetPasswordExpires DateTime?`

**Templates nuevos**:
- `verify-email.template.ts` — botón de verificación, aviso de expiración 24h, nota de seguridad
- `reset-password.template.ts` — aviso de expiración 1h, botón de reset, nota "si no fuiste tú, ignora"

**`apps/api/src/app/auth/auth.service.ts`** — Nuevos métodos:
- `verifyEmail(token)` — verifica JWT, busca por resetPasswordToken, actualiza emailVerified: true
- `resendVerification(email)` — anti-enum, genera nuevo token, reenvía email
- `forgotPassword(email, panel?)` — anti-enum, genera token 1h, guarda en BD, envía email con URL del panel correcto
- `resetPassword(token, newPassword)` — verifica JWT + campo BD + expiry → hash + update + limpia token

**`apps/api/src/app/auth/auth.controller.ts`** — 4 endpoints nuevos:
- `GET /auth/verify-email?token=` — verifica email
- `POST /auth/resend-verification { email }` — reenvía verificación
- `POST /auth/forgot-password { email, panel? }` — solicita reset
- `POST /auth/reset-password { token, newPassword }` — restablece contraseña

**`apps/api/src/app/mail/templates/welcome-user.template.ts`** — Modificado: menciona verificación de email en el email de bienvenida.

**`apps/web-client/src/lib/api.ts`** — Funciones nuevas:
- `verifyEmail(token)`, `resendVerification(email)`, `forgotPassword(email)`, `resetPassword(token, newPassword)`

**`apps/web-host/src/lib/api.ts`** — Funciones nuevas:
- `forgotPassword(email)`, `resetPassword(token, newPassword)`

**`apps/web-admin/lib/api.ts`** — Funciones nuevas:
- `forgotPassword(email)`, `resetPassword(token, newPassword)`

#### Auth Flow — Páginas de Autenticación (Frontend)

**Web Client** (nuevas páginas):
- `apps/web-client/src/app/verify-email/page.tsx` — estados: verificando / éxito / token expirado + reenvío
- `apps/web-client/src/app/forgot-password/page.tsx` — form email + pantalla éxito "Revisa tu correo"
- `apps/web-client/src/app/reset-password/page.tsx` — nueva contraseña + confirmar + toggle + auto-redirect 3s

**Web Client** (modificados):
- `apps/web-client/src/app/register/page.tsx` — paso 2 muestra pantalla "Revisa tu correo"
- `apps/web-client/src/app/login/page.tsx` — link "¿Olvidaste tu contraseña?" junto al label Password

**Web Host** (nuevas páginas):
- `apps/web-host/src/app/forgot-password/page.tsx` — solicitar reset con nota "válido 60 min"
- `apps/web-host/src/app/reset-password/page.tsx` — nueva contraseña + auto-redirect 3s al login

**Web Host** (modificado):
- `apps/web-host/src/app/login/page.tsx` — link "¿Olvidaste tu contraseña?"

**Web Admin** (nuevas páginas):
- `apps/web-admin/app/forgot-password/page.tsx` — menciona "cuenta de administrador"
- `apps/web-admin/app/reset-password/page.tsx` — nueva contraseña + auto-redirect 3s al login

**Web Admin** (modificado):
- `apps/web-admin/app/login/page.tsx` — link "¿Olvidaste tu contraseña?"

**.env** — Añadido `NEXT_PUBLIC_ADMIN_URL=http://localhost:4202`

#### Migración de URL `/events/` → `/eventos/`

**Contexto**: La ruta del Portal de Clientes para ver eventos pasó de `/events/[id]` (inglés) a `/eventos/[id]` (español).

**Archivos creados**:
- `apps/web-client/src/app/eventos/[id]/page.tsx` — página SSR con OG metadata apuntando a `/eventos/`
- `apps/web-client/src/app/eventos/[id]/EventDetailClient.tsx` — cliente completo con login redirect y toast apuntando a `/eventos/`

**Archivos modificados** (href `/events/` → `/eventos/`):
- `apps/web-client/src/components/EventCard.tsx`
- `apps/web-client/src/components/FeaturedEventsSection.tsx`
- `apps/web-client/src/components/HeroCarousel.tsx`
- `apps/web-client/src/app/my-tickets/page.tsx`

**Eliminado**: Carpeta `apps/web-client/src/app/events/[id]/` completa.

**No modificado** (correcto así):
- `apps/web-client/src/lib/api.ts:130` — llama a `/api/events/${id}` (backend NestJS, no ruta frontend)
- `apps/web-host/src/lib/api.ts` y `apps/web-admin/lib/api.ts` — llaman al backend, no son rutas frontend

---

### Sesión del 22-23 de Mayo de 2026 — UX/UI Web Client + URL Slugs + Rebrand AfroEventos

Ver detalle completo en CHECKPOINT_RESTORE.md sección "Sesión del 22-23 de Mayo 2026".

**Resumen**:
- NX Daemon reactivado (`useDaemonProcess: true` + `watch: true`)
- Slugs amigables para eventos (`/eventos/fiestas-de-san-luis-de-salinas`)
- Backend acepta slug o UUID indistintamente
- Rebrand completo: OpenTicket → AfroEventos (navbar, footer, login, admin, mobile)
- Zonas GRATIS: precio $0 muestra "GRATIS", oculta selectores/total/botón comprar
- Avatar circular del organizador en página de detalle de evento

### Sesiones del 17-20 de Mayo de 2026 — Carrusel, Destacados, Imagen Retrato, Perfil Host, Logo SVG, Footer, Páginas Legales

Ver detalle completo en CHECKPOINT_RESTORE.md secciones "Sesión del 17-20 de Mayo 2026".

**Resumen**:
- Carrusel Hero coverflow con 3 tarjetas (circular motion via doble rAF teleport)
- Sección Eventos Destacados (condicional, solo si hay eventos con `isFeatured: true`)
- Cron job de expiración automática de destacados (cada hora)
- Campo `portraitImageUrl` (imagen retrato 3:4) en schema, backend y formularios
- Página Perfil en Panel Host (info personal, org, cambio contraseña)
- Gestión de OrganizerMembers en Panel Host
- Logo oficial SVG AfroEventos integrado en las 3 apps
- Footer rediseñado con redes sociales y links legales
- Páginas `/politicas-de-privacidad` y `/terminos-y-condiciones`

### Sesión del 8 de Mayo de 2026 — Asistentes y Escáner (Host) + Tickets Usados Gris (Client)

**Resumen**:
- `AttendeesList.tsx`: vista de compradores por evento con tickets comprados/usados y estado de asistencia
- `TicketScanner.tsx`: 3 tabs (cámara QR con jsQR, ID corto, token JWT manual)
- Endpoint `GET /orders/attendees/me` (decodifica JWTs, agrupa por usuario+evento)
- Endpoint `POST /tickets/validate-by-id` (busca por `id.startsWith`)
- Tickets USED en el Portal Cliente: estilo "apagado" completo (colores grises, botones ocultos)

### Sesión del 3 de Mayo de 2026 — Mi Perfil (Clientes), Toast de Login

**Resumen**:
- Página `/my-profile` con avatar, datos personales, identificación, dirección Ecuador
- 8 campos nuevos en schema `User` (avatarUrl, idType, idNumber, province, city, birthDate, citizenship)
- Endpoints `GET/PATCH /api/auth/me` protegidos con JwtAuthGuard
- Toast amarillo al intentar seleccionar asientos sin autenticación (auto-cierre 4s)

### Sesión del 30 de Mayo de 2026 (Sesión 8) — Deploy API en Producción (Coolify)

#### Estado del Deploy

- **URL**: `https://api.afroeventos.com/api` — corriendo y respondiendo `{"message":"Hello API"}`
- **Plataforma**: Coolify v4.1.1 sobre servidor localhost
- **Imagen**: Docker multistage (`node:20-alpine`)
- **Base de datos**: `afroeventos-postgres` (PostgreSQL 16-alpine, interno Coolify)
- **Cache**: `afroeventos-redis` (Redis 7.2, interno Coolify)
- **Almacenamiento imágenes**: Volume Mount en `/app/uploads` (persistente entre deployments)

#### Archivos modificados/creados

| Archivo | Cambio |
| :--- | :--- |
| `apps/api/Dockerfile` | Agregado `apk add openssl` (Prisma lo requiere en alpine), `prisma generate` antes del build NX, `mkdir -p uploads`, `npm install --legacy-peer-deps` en lugar de `npm ci` |
| `.dockerignore` | Nuevo — excluye `node_modules`, `dist`, `.next`, `uploads`, `.env*`, `.git` del build context |
| `.gitignore` | Agregada sección `# Environment files` con `.env`, `.env.*`, `!.env.example` |
| `.env.production` | Creado localmente (no commiteado) con variables de producción reales |

#### Variables de entorno en Coolify

Configuradas en la pestaña Environment Variables del servicio `afroeventos-api`:
- `DATABASE_URL` — PostgreSQL interno Coolify
- `REDIS_URL` — Redis interno Coolify
- `JWT_SECRET` — clave de 64 chars generada aleatoriamente
- `PORT=3000`
- `NEXT_PUBLIC_API_URL=https://api.afroeventos.com/api`
- `NEXT_PUBLIC_SITE_URL=https://afroeventos.com`
- `NEXT_PUBLIC_HOST_URL=https://host.afroeventos.com`
- `NEXT_PUBLIC_ADMIN_URL=https://admin.afroeventos.com`
- Variables MAIL (vacías por ahora), STORAGE_PROVIDER=local, límites de imágenes

#### Errores resueltos durante el deploy

| Error | Causa | Fix |
| :--- | :--- | :--- |
| `open Dockerfile: no such file or directory` | Coolify apuntaba a `/Dockerfile` (raíz) | Cambiar a `/apps/api/Dockerfile` en Configuration → General |
| `npm ci lockfile out of sync` | `yaml@2.9.0` faltaba en lock file | Cambiar a `npm install --legacy-peer-deps` en Dockerfile |
| `Module '"@prisma/client"' has no exported member 'Role'` | Prisma Client no generado antes del build | Agregar `npx prisma generate` antes de `npx nx build api` |
| `Prisma failed to detect libssl / Please manually install OpenSSL` | `node:20-alpine` no incluye OpenSSL | Agregar `apk add --no-cache openssl` en etapa final |

#### Configuración Coolify

| Campo | Valor |
| :--- | :--- |
| Base Directory | `/` |
| Dockerfile Location | `/apps/api/Dockerfile` |
| Persistent Volume | `afroeventos-uploads` → `/app/uploads` |

---

### Sesión del 28 de Mayo de 2026 (Sesión 7) — Paginación Real + Sistema de Imágenes + Code Review

#### Paginación Real en API

- **`GET /api/events?page=&limit=`** — devuelve `{ data, total, page, limit, totalPages }`, filtra solo `PUBLISHED`, default `limit=12`
- **`GET /api/admin/organizers?page=&limit=`** — ídem, default `limit=20`
- **`GET /api/admin/events?page=&limit=`** — ídem, default `limit=20`
- **`EventsGrid`** — paginación real: muestra 3 eventos por fila (ROW_SIZE=3), carga 12 del API cuando se agotan los cargados. Recibe `excludeIds` para no duplicar eventos destacados. `useTransition` reemplazado por `useState<boolean>` para deshabilitar correctamente el botón durante la carga
- **`page.tsx`** — `generalTotal` calculado correctamente: si `result.data.length < limit` (todos los eventos en una página) usa `generalEvents.length` exacto; si hay más páginas, estima `result.total - featuredEvents.length`
- **web-admin dashboard** — controles Anterior/Siguiente en tablas de organizadores y eventos; `loadOrganizers(page)` y `loadEvents(page)` siempre reciben la página explícita (sin default params para evitar stale closure)

#### Sistema de Imágenes — Completamente Configurable desde `.env`

| Variable | Descripción | Default |
|---|---|---|
| `STORAGE_PROVIDER` | `local` (VPS) o `cloudinary` (CDN) | `local` |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | Credenciales Cloudinary | vacío |
| `NEXT_PUBLIC_MAX_UPLOAD_MB` | Tamaño máximo de subida (MB) | `2.5` |
| `NEXT_PUBLIC_ALLOWED_IMAGE_TYPES` | Formatos permitidos (MIME) | `image/jpeg,image/png,image/webp` |
| `UPLOAD_IMAGE_QUALITY` | Calidad WebP 1-100 | `80` |

- **Sharp WebP**: toda imagen subida se convierte a WebP con la calidad configurada, sin redimensionar (el organizador sube cada imagen con la proporción correcta). Fix crítico: escribe a `.tmp` primero para evitar corrupción si el archivo ya es `.webp`
- **Cloudinary**: cuando `STORAGE_PROVIDER=cloudinary`, Sharp comprime primero y luego sube el WebP optimizado (ahorra cuota de Cloudinary)
- **`MulterExceptionFilter`**: captura errores de Multer y devuelve mensajes en español
- **Validación en 2 capas**: frontend (selector de archivos + check `file.size`) + backend (Multer limits + fileFilter)
- Labels de los formularios (`Max XMB`) leen `process.env.NEXT_PUBLIC_MAX_UPLOAD_MB` dinámicamente

#### Code Review — 7 Bugs Corregidos

| Severidad | Archivo | Fix |
|---|---|---|
| Crítico | `upload.controller.ts` | Sharp corrupción WebP: escritura atómica via `.tmp` + rename |
| Alto | `web-client/lib/api.ts` | Doble URL encoding: eliminado `encodeURIComponent` en `params.set()` |
| Medio | `page.tsx` | `generalTotal` incorrecto cuando featured events en páginas 2+ |
| Medio | `EventsGrid.tsx` | `useTransition` async no deshabilita botón en React 18 → `useState<boolean>` |
| Medio | `dashboard/page.tsx` | Stale closure en paginación → siempre pasar página explícita |
| Optimización | `events.service.ts` | `create()` reutiliza perfil ya cargado, evita query redundante a BD |
| Limpieza | `admin.service.ts` | `role: 'HOST' as const` → `role: 'HOST' as 'HOST'` |

- **Hydration error fix**: `suppressHydrationWarning` en `<body>` de los 3 layouts — soluciona warning causado por extensiones del navegador (ej: Grammarly) que inyectan atributos en el DOM

### Sesión del 25 de Mayo de 2026 — Control de Pasarela de Pagos + Límites Anuales por Aniversario

**Control de Pasarela de Pagos (Payment Gateway Control)**:

Sistema de doble nivel para bloquear eventos de pago antes de integrar pasarela real:

- **Schema**: modelo `SystemConfig` (singleton `id="global"`) + campo `paidEventsEnabled Boolean?` en `OrganizerProfile`
- **Backend endpoints nuevos**:
  - `GET /api/admin/config` — obtener config global (solo ADMIN)
  - `PATCH /api/admin/config` — toggle global (solo ADMIN)
  - `PATCH /api/admin/organizers/:id/payment-gateway` — override por org (solo ADMIN)
  - `GET /api/events/payment-status` — consulta del organizador autenticado (HOST)
- **Lógica de resolución** en `EventsService.getPaymentStatusForOrganizer()`: override org (`null/true/false`) ?? config global
- **Enforcement backend**: en `create()` y `update()` de eventos, si `!paidEnabled`, fuerza `price=0` y `capacity=0` en zonas (excepto `sellOnSite`)
- **Admin UI** (`web-admin/app/dashboard/page.tsx`):
  - Card "Pasarela de Pagos" con badge HABILITADA/DESHABILITADA y botón toggle (solo ADMIN, con confirmación modal)
  - Columna "Pagos" en tabla de organizadores con botón cíclico: Global (gris) → Habilitado (verde) → Deshabilitado (rojo) → Global
- **Host UI** (`CreateEventForm.tsx` y `EditEventForm.tsx`):
  - Carga `GET /events/payment-status` al montar el formulario
  - Banner naranja de advertencia cuando `paidEventsEnabled === false`
  - Inputs `precio` y `capacidad` deshabilitados y forzados a 0 cuando gateway desactivado
  - Submit sanitiza `price` y `capacity` a 0 si no disponible

**Límites de Eventos por Plan — Conteo Anual por Aniversario**:

- **Problema**: el conteo anterior usaba `_count.eventsOwned` (total de todos los tiempos)
- **Fix**: helper privado `getAnnualPeriodStart(profileCreatedAt)` en `EventsService`
  - Avanza la fecha de creación del perfil de 1 en 1 año hasta que el próximo aniversario esté en el futuro
  - Retorna la fecha del aniversario actual como inicio del período
  - Correcto para cualquier año, incluyendo años bisiestos
- **Implementación**: `prisma.event.count({ where: { organizerId, createdAt: { gte: periodStart } } })` (query separada)
- **Error message**: incluye fecha de renovación `renewDate` en formato `'es-EC'` (ej: "15 de marzo de 2027")

### Sesión del 2 de Mayo de 2026 — Logo Organizaciones, Planes Dinámicos, CRUD Admin

**Resumen**:
- Logo de organización en registro, edición y tabla del admin
- Planes cargados desde BD (no hardcoded) en registro de Host
- CRUD completo de Planes en Admin (`Plan` model, endpoints `/api/admin/plans`)
- CRUD de Usuarios Admin/Editor con roles diferenciados
- Bloqueo de login para cuentas PENDING/REJECTED con mensajes descriptivos
