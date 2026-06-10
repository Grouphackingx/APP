# PROJECT CONTEXT & HANDOVER: AfroEventos

**Última Actualización:** 9 de Junio de 2026 (Sesión 23)
**Estado del Proyecto:** Fases 1-4 Completas + Portal Cliente completo + Panel Host completo + Panel Admin completo + Sistema de Emails Transaccionales completo + Auth flow (verify/forgot/reset password) + URLs `/eventos/` en español + Favicons AfroEventos + Sistema de Banners Publicitarios completo (full-stack) + UI/UX Portal Cliente (Destacados Adaptativos + FeaturedCarousel + EventsGrid con paginación real) + OrganizerCTA + Navbar dropdown + Galería de eventos rediseñada + sellOnSite en zonas (full-stack) + Bloqueo de Organizadores (full-stack) + Modales personalizados (sin confirm/alert nativo) + Persistencia de vista en URL + Impersonación de Organizadores por Admin + Control de Pasarela de Pagos (global + por organizador) + Límite de eventos por plan con conteo anual por aniversario + Paginación real en API + Sistema de imágenes optimizado (Sharp WebP + límites configurables desde .env) + **UI Polish**: precios ocultos en EventCard + hover shadows eliminados en navbar + logos de sidebars clicables + logo footer clicable + **PLATAFORMA COMPLETA EN PRODUCCIÓN**: API + 3 frontends desplegados en Coolify + DB con schema aplicado + primer admin creado + **EMAILS EN PRODUCCIÓN**: Resend SMTP configurado + 12 plantillas con logo oficial + best practices de entregabilidad + **Sesión 13**: Asistentes Admin + Planes ocultos + Preview eventos + Flujo Borrador→Publicar + **Sesión 14**: Categorías full-stack + Buscador fix + Banner slider fixes + **Sesión 15**: Modo Prueba + Kill-switch pagos + UX compra + **Sesión 16**: `.env` sacado de git + `findAll` optimizado + limpieza imágenes huérfanas + `as any` eliminados + **Sesión 17**: UX Responsive Portal Cliente completo (imagen 1:1 móvil portrait, hero carousel oculto móvil, tablet hero/destacados mejorado, `object-fit:contain`, logo admin login clicable, OrganizerCTA segundo botón) + **Sesión 18**: Validación completa de formularios (`@Matches` teléfono en backend + `pattern`/`type=tel` en 6 frontends) + UX web-host registro (prefijo +593 en teléfono, etiquetas botones simplificadas) + **Sesión 19**: `Ticket.eventId/zoneName/seatNumber` (denormalizado, paginación real de `attendees/me` + notificaciones sin decodificar JWT, backfill) + Sistema de imágenes con resize server-side por tipo (Sharp `kind`: banner libre/no-recorta, cuadrada 1080×1080, retrato 1200×1600) + aviso de resolución mínima + etiquetas con tamaño recomendado + banner a proporción natural (detalle/tarjeta destacada/preview host) + `uploads/` sacado de git tracking (commit `9cc64bb`) + de-duplicación de estilos de tickets en `global.css` (fix grilla 2-vs-3 columnas) + **Sesión 21**: Copy UI web-client (hero headline "EL PUNTO DE ENCUENTRO DE NUESTRA GENTE", subtítulo, fuente 1.13rem, OrganizerCTA 1.04rem, CTA login eventos) + web-admin puerto 4202 fijado en project.json + **Sesión 22**: SEO/OG metadata completo (título, descripción, opengraph-image.tsx, JSON-LD Organization) + sistema de favicon completo (favicon.svg negro rx=120, logo-og.svg para Google, apple-touch-icon.png PNG 1080×1080, redirect /favicon.ico, next.config.js) + **Sesión 23**: Notificación por email a admins globales cuando se registra un nuevo organizador (template `new-organizer-registered` + `sendNewOrganizerAlert` + fire-and-forget en `registerHost`)
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
| **Email**           | Nodemailer + @nestjs/mailer         | Resend SMTP (`smtp.resend.com:587`) — dominio `afroeventos.com` verificado |
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

# Email (Resend SMTP — dejar vacío para modo silencioso local)
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=resend
MAIL_PASS=<resend_api_key>
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
  isBlocked Boolean @default(false)  // true = login bloqueado con mensaje de suspensión
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
  isHidden Boolean @default(false)  // true = no visible en registro de organizadores; solo Admin puede asignarlo
  → organizers OrganizerProfile[]
}

model Banner {
  id, imageUrl, linkUrl?, title?
  isActive (default true), order (default 0)
  createdAt, updatedAt
}

model EventCategory {
  id, name (unique), icon?, order (default 0)
  isActive (default true)
  createdAt, updatedAt
}
// Poblar con: POST /api/categories/seed (requiere JWT ADMIN)

model Event {
  id, slug? (unique), title, description?, date, location, city?, province?
  imageUrl?, bannerImageUrl?, squareImageUrl?, portraitImageUrl?
  status (default DRAFT)
  isFeatured (default false), featuredUntil?
  category String  // almacena EventCategory.name — validado en formularios del host
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
  // Denormalizado desde el QR JWT (Sesión 19) — permite filtrar/paginar por evento en BD:
  eventId? (indexado), zoneName?, seatNumber?
}
```

**Nota crítica**: El `Ticket` no tiene relación directa con `Seat`. El `seatId` sigue solo en el QR JWT. Desde la Sesión 19, `eventId`, `zoneName` y `seatNumber` están denormalizados como columnas (nullable), así que `getMyEventAttendees` y `notifyBuyersOfChange` filtran por `eventId` en BD en lugar de decodificar todos los JWT. Se mantiene fallback a decodificar el JWT cuando la columna es nula (tickets previos al backfill). Backfill idempotente: `node scripts/backfill-ticket-event.js`. `GET /orders` sigue decodificando el JWT por ticket (acotado por la paginación).

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
- **Proveedor en producción**: Resend SMTP (`smtp.resend.com:587`, STARTTLS). Puerto 465 bloqueado por el hosting — usar siempre 587 con `MAIL_SECURE=false`.
- **Dominio verificado**: `afroeventos.com` en Resend (región us-east-1). Remitente: `no-reply@afroeventos.com`.
- **Texto plano automático** (Sesión 23): `mail.service.ts` genera versión `text/plain` con `htmlToText()` para cada email enviado — mejora entregabilidad en todos los templates (penalización de filtros spam por HTML-only eliminada).

### Entregabilidad — DNS de `afroeventos.com` (configuración completa ✅)

| Registro | Estado | Detalle |
| :--- | :--- | :--- |
| **DKIM** | ✅ | `resend._domainkey.afroeventos.com` TXT — Resend firma automáticamente |
| **SPF** | ✅ | `send.afroeventos.com` TXT: `v=spf1 include:amazonses.com ~all` — subdominio envelope-from de Resend |
| **DMARC** | ✅ | `_dmarc.afroeventos.com` TXT: `v=DMARC1; p=quarantine; rua=mailto:soporte@afroeventos.com` — agregado Sesión 23 |
| **MX rebotes** | ✅ | `send.afroeventos.com` MX → `feedback-smtp.us-east-1.amazonses.com` |

### Base Layout (`base.layout.ts`) — Compatibilidad de Clientes de Correo

- `<style>` movido de `<head>` a `<body>` — Gmail elimina todos los estilos en `<head>`.
- Namespaces VML de Outlook (`xmlns:v`, `xmlns:o`) en el `<html>`.
- `bgcolor` en todos los `<td>` — fallback para Outlook que ignora `background-color` CSS.
- Exporta `iconCircle(emoji, bgColor, borderColor, size?)` — tabla HTML para círculos de íconos (reemplaza `<div display:inline-block>` incompatible con Outlook).
- Logo oficial: `<img src="https://afroeventos.com/logo-blanco.svg" width="160" height="57">` centrado en el header.
- Sin botones de redes sociales en footer. Footer incluye links a `/politicas-de-privacidad`, `/terminos-y-condiciones` y `soporte@afroeventos.com`.

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
| `sendNewOrganizerAlert(to, adminName, { organizerName, organizerEmail, organizationName, city?, province? })` | `new-organizer-registered` | Alerta a cada admin global cuando se registra un nuevo organizador pendiente de revisión |

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
- [x] ~~Dockerfiles frontends con output standalone~~ ✅ (30 May 2026)
- [x] ~~Deploy frontends en Coolify~~ ✅ (30 May 2026) → `https://afroeventos.com`, `https://host.afroeventos.com`, `https://admin.afroeventos.com`
- [x] ~~Schema de BD aplicado en producción~~ ✅ (30 May 2026) → `prisma db push` en CMD del API Dockerfile
- [x] ~~Primer usuario ADMIN creado en producción~~ ✅ (30 May 2026) → usuario "Blade" (`dmxwilly@gmail.com`)
- [x] ~~Gestión de Asistentes en Admin~~ ✅ (31 May 2026) → página completa con edición, bloqueo, exportación
- [x] ~~Previsualización de eventos antes de publicar~~ ✅ (31 May 2026) → EventPreviewModal en web-host

### Prioridad Media

- [x] ~~Sistema de categorías de eventos~~ ✅ (2 Jun 2026)
- [x] ~~Optimizar queries de findAll (sin traer todos los seats)~~ ✅ (3 Jun 2026) → `_count` aggregate en listado general
- [x] ~~Paginación en `GET /orders` y `GET /orders/attendees/me`~~ ✅ (5 Jun 2026) → ambos paginan; `attendees/me` filtra por la nueva columna `Ticket.eventId`
- [x] ~~Deuda técnica: `eventId` no en BD (decodificar todos los JWT)~~ ✅ (5 Jun 2026) → columnas `eventId`/`zoneName`/`seatNumber` en `Ticket`
- [ ] CDN para imágenes (Cloudinary preparado, solo falta `STORAGE_PROVIDER=cloudinary` + credenciales)
- [ ] Reportes financieros básicos para organizadores (ingresos por evento)

### Prioridad Baja

- [ ] Websockets para mapa de asientos en tiempo real
- [x] ~~Rate limiting en API~~ ✅ (8 Jun 2026) → `@Throttle()` en endpoints sensibles; mensajes 429 en español en los 3 frontends
- [ ] CI/CD pipeline con tests
- [ ] Tests unitarios e integración

---

## 11. Problemas Conocidos / Notas Técnicas

- **Puertos no estándar**: PostgreSQL en 5435, Redis en 6380.
- **Prisma 5.22.0**: Versión bloqueada por incompatibilidades de CLI con v7+.
- **Pagos simulados**: El módulo `PaymentsService` siempre retorna `true`.
- **Ticket sin relación a Seat**: El modelo `Ticket` no tiene `seatId`. El `seatId` se codifica solo en el QR JWT (no se usa en lecturas).
- **eventId en Ticket DB** ✅ (5 Jun 2026): `Ticket` ahora tiene `eventId` (indexada), `zoneName` y `seatNumber`. `notifyBuyersOfChange` y `getMyEventAttendees` filtran por `eventId` en BD en lugar de decodificar todos los JWT. Se mantiene fallback de decodificación para tickets antiguos con columna nula. Backfill idempotente: `node scripts/backfill-ticket-event.js` (correr una vez en local y en el contenedor API de Coolify).
- **ValidationPipe Global**: `main.ts` tiene `whitelist: true`. PATCH de eventos usa `@Request()` para evitar filtrado de campos de zona.
- **NX Daemon**: Activo con `useDaemonProcess: true` y `watch: true` en `project.json`. Hot-reload automático.
- **Emails vacíos**: Si `MAIL_HOST` está vacío en `.env`, los emails fallan silenciosamente (no bloquean el flujo).
- **Puerto SMTP en producción**: El puerto 465 (SSL) está bloqueado por el servidor de Coolify. Usar siempre **puerto 587** con `MAIL_SECURE=false` (STARTTLS).
- **Anti-enumeración**: `forgot-password` y `resend-verification` siempre retornan 200 con el mismo mensaje.
- **Galería de imágenes**: Al editar un evento, las imágenes de galería se acumulan (no se reemplazan las anteriores).

---

## 12. Infraestructura de Producción — Coolify

### Plataforma

- **Coolify v4.1.1** — self-hosted sobre servidor propio (proyecto "AfroEventos", entorno "production")
- **Servidor**: localhost (el mismo servidor donde corre Coolify)
- **Repositorio**: `https://github.com/Grouphackingx/APP.git` (rama `main`)
- **Auto-deploy**: activado — cada `git push origin main` dispara el redeploy automático de todos los servicios

### Servicios en Coolify

| Servicio | URL producción | Dockerfile | Puerto interno |
| :--- | :--- | :--- | :--- |
| `afroeventos-api` | `https://api.afroeventos.com` | `/apps/api/Dockerfile` | 3000 |
| `afroeventos-web-client` | `https://afroeventos.com` | `/apps/web-client/Dockerfile` | 3000 |
| `afroeventos-web-host` | `https://host.afroeventos.com` | `/apps/web-host/Dockerfile` | 3000 |
| `afroeventos-web-admin` | `https://admin.afroeventos.com` | `/apps/web-admin/Dockerfile` | 3000 |
| `afroeventos-postgres` | interno | — (imagen oficial) | 5432 |
| `afroeventos-redis` | interno | — (imagen oficial) | 6379 |

### Proceso de Deploy

1. Hacer cambios en local → commit → `git push origin main`
2. Coolify detecta el push y lanza redeploy automático de los 4 servicios
3. Si hay cambios de schema Prisma: ir a Coolify → `afroeventos-api` → pestaña **Terminal** → conectar al contenedor → ejecutar `npx prisma db push`
4. Verificar que todos los servicios estén en verde (🟢 Running) en el panel

### Acceder al Terminal del Contenedor API

Coolify → Projects → AfroEventos → production → `afroeventos-api` → pestaña **Terminal** → seleccionar el contenedor en el dropdown → **Connect**

Desde ahí se pueden ejecutar comandos dentro del contenedor en ejecución:
```bash
npx prisma db push              # aplicar cambios de schema
npx prisma studio               # GUI de base de datos (no recomendado en prod)
node -e "..."                   # scripts Node.js puntuales (ej: crear admin)
```

### Variables de Entorno por Servicio

**`afroeventos-api`** (Environment Variables — runtime):
```
DATABASE_URL=postgresql://...@afroeventos-postgres:5432/openticket_db
REDIS_URL=redis://afroeventos-redis:6379
JWT_SECRET=<64 chars aleatorios>
PORT=3000
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=resend
MAIL_PASS=<resend_api_key>
MAIL_FROM=AfroEventos <no-reply@afroeventos.com>
STORAGE_PROVIDER=local
NEXT_PUBLIC_MAX_UPLOAD_MB=2.5
NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
UPLOAD_IMAGE_QUALITY=80
```

**Frontends** (Build Variables — baked en tiempo de build, NO en Environment Variables):
```
NEXT_PUBLIC_API_URL=https://api.afroeventos.com/api
NEXT_PUBLIC_SITE_URL=https://afroeventos.com
NEXT_PUBLIC_HOST_URL=https://host.afroeventos.com
NEXT_PUBLIC_ADMIN_URL=https://admin.afroeventos.com
NEXT_PUBLIC_MAX_UPLOAD_MB=2.5
NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

> ⚠️ **Crítico**: Los `NEXT_PUBLIC_*` deben ir en **Build Variables** (no Environment Variables). Next.js los bakea en el JS del cliente durante `docker build`. Si se ponen como Env Vars (runtime), quedan vacíos en el navegador.

### Volúmenes Persistentes

- `afroeventos-uploads` → montado en `/app/uploads` del contenedor API — persiste las imágenes subidas entre deployments

### Advertencia: `nx serve` en Producción

`npx nx serve api` **NO** funciona correctamente en producción. En modo desarrollo, NX lanza un servidor HMR/WebSocket en el mismo puerto 3000 que intercepta las peticiones HTTP antes de que lleguen a NestJS, devolviendo `"WebSockets request was expected"` a todos los clientes.

**Siempre correr el API con**:
```bash
npx nx build api && node dist/apps/api/main.js
```
O en los contenedores Coolify, el CMD del Dockerfile ya usa `node dist/apps/api/main.js` directamente.

---

## 13. Sistema de Categorías de Eventos

### Arquitectura

Las categorías son entidades gestionables en la BD (`EventCategory`). El campo `Event.category` almacena el `name` de la categoría como `String` (compatibilidad con datos existentes). Las categorías se gestionan desde web-admin y se exponen públicamente para filtrado en web-client y selección en formularios de web-host.

### Backend (`apps/api/src/app/categories/`)

| Archivo | Descripción |
| :--- | :--- |
| `categories.module.ts` | `CategoriesModule` — registrado en `AppModule`, exporta `CategoriesService` |
| `categories.service.ts` | CRUD + seed con 13 categorías predeterminadas |
| `categories.controller.ts` | Endpoints del controlador |

**Endpoints:**

| Método | Ruta | Auth | Descripción |
| :----- | :--- | :--- | :---------- |
| GET | `/api/categories` | No | Categorías activas (opcional: `?withEvents=true` — solo con eventos generales publicados) |
| GET | `/api/categories/admin` | JWT (ADMIN/EDITOR) | Todas las categorías con conteo de eventos |
| POST | `/api/categories/seed` | JWT (ADMIN) | Carga 13 categorías predeterminadas (idempotente) |
| POST | `/api/categories` | JWT (ADMIN/EDITOR) | Crear categoría |
| PATCH | `/api/categories/:id` | JWT (ADMIN/EDITOR) | Editar (si cambia nombre, actualiza todos los eventos que la usan) |
| DELETE | `/api/categories/:id` | JWT (ADMIN/EDITOR) | Eliminar (bloqueado si tiene eventos asociados) |

**Filtro `?withEvents=true`**: cuenta solo eventos con `status=PUBLISHED` que **no** sean actualmente destacados (`isFeatured=false` o con `featuredUntil` expirado). Esto asegura que las pills del portal solo aparezcan para categorías con eventos visibles en la grilla general.

**Categorías predeterminadas (seed)**: Música 🎵, Baile 💃, Cultura 🎭, Fiestas 🎉, Festival 🌟, Conciertos 🎤, Deportes ⚽, Gastronomía 🍽️, Arte 🎨, Teatro 🎬, Conferencia 🎙️, Fiestas y Bailes 🕺, Otro 📌

### Admin UI (`CategoriesView` en `apps/web-admin/app/dashboard/page.tsx`)

- Ítem **"🏷️ Categorías"** en el Sidebar (entre Banners y Usuarios)
- Tabla con: ícono, nombre, orden, conteo de eventos, estado (Activa/Inactiva)
- Acciones: Editar, Activar/Desactivar, Eliminar (con modal de confirmación)
- Formulario inline: nombre (requerido), ícono emoji, número de orden
- Botón **"Cargar predeterminadas"** — llama a `POST /categories/seed` (idempotente, solo crea las que faltan)
- Estado vacío con instrucciones para hacer seed inicial

### Web-Host (formularios de evento)

`CreateEventForm.tsx` y `EditEventForm.tsx` cargan categorías dinámicamente desde `GET /categories` al montar el componente. El selector muestra `nombre` (sin ícono para consistencia visual). Si las categorías aún no se han cargado, muestra la categoría existente del evento o "Cargando…".

### Web-Client (pills de filtro)

- `getEventCategories()` llama a `GET /categories?withEvents=true`
- Las pills se muestran centradas con `justify-content: center` solo si hay **≥ 2 categorías** con eventos generales
- `scroll={false}` en los Links de pills — evita saltar al top de la página al filtrar
- `key={category ?? 'all'}-${query ?? ''}` en `EventsGrid` — fuerza reset del estado React al cambiar categoría
- Los eventos **destacados** son independientes del filtro de categoría (se muestran siempre)
- Al buscar con query, todos los resultados van al grid (incluyendo destacados) — evita el bug donde un evento destacado que coincide con la búsqueda no aparecía

### Notas técnicas

- **Primera vez en producción**: ejecutar `npx prisma db push` en Terminal del contenedor API, luego hacer seed desde Admin → Categorías → "Cargar predeterminadas"
- **Renombrar categoría**: el service actualiza automáticamente todos los eventos que la usan (`updateMany`) antes de actualizar el nombre en `EventCategory`
- **Pills visibles**: requieren ≥ 2 categorías con eventos generales (no destacados). Con 1 sola categoría, el filtro no tiene utilidad y no se muestra

---

## 14. Registro de Cambios

### Sesión del 9 de Junio de 2026 (Sesión 23) — Notificación a Admins al Registrarse un Nuevo Organizador

#### Contexto / objetivo
Cuando un nuevo organizador se registra, los administradores globales no recibían ningún aviso. El perfil quedaba en estado PENDING indefinidamente hasta que el admin visitara el panel manualmente. El objetivo es avisarles de inmediato por email para agilizar la aprobación.

#### Cambios realizados

**`apps/api/src/app/mail/templates/new-organizer-registered.template.ts`** *(nuevo)*:
- Template email para administradores globales
- Hero con badge "Acción requerida" + ícono 🔔
- Card de datos del solicitante: Organización, Representante, Correo, Ubicación
- CTA `"Revisar solicitud →"` que enlaza directo a `${adminUrl}?view=organizers`
- Preview text optimizado para notificaciones en bandeja de entrada

**`apps/api/src/app/mail/mail.service.ts`**:
- Import del nuevo template
- Nuevo método `sendNewOrganizerAlert(to, adminName, { organizerName, organizerEmail, organizationName, city?, province? })`
- Asunto: `"🔔 Nueva solicitud de organizador: [Nombre Organización]"`
- Usa `NEXT_PUBLIC_ADMIN_URL` de config para construir el link

**`apps/api/src/app/auth/auth.service.ts`**:
- Después del `sendWelcomeHost` (fire-and-forget), se hace `prisma.user.findMany({ where: { role: 'ADMIN' } })`
- Se envía `sendNewOrganizerAlert` a cada admin en paralelo (fire-and-forget individual)
- Si no hay admins o falla el query, no afecta el registro del organizador

#### Comportamiento
- El organizador se registra → recibe su email de bienvenida (existente) → sin cambios visibles para él
- Cada admin con `role: ADMIN` recibe el email de alerta con los datos del nuevo organizador y un botón directo a la sección de Organizadores del panel
- Todo fire-and-forget: si el email falla, el registro del organizador no se ve afectado
- Sin cambios de schema ni migrations

---

### Sesión del 8 de Junio de 2026 (Sesión 22) — SEO / OG Metadata + Sistema de Favicon Completo

#### Contexto / objetivo
Mejorar el aspecto del sitio al compartir links (WhatsApp, Telegram, Slack, Discord, Twitter/X) y en resultados de búsqueda de Google. El favicon anterior era transparente y no tenía imagen OG configurada.

#### Cambios realizados

**`apps/web-client/src/app/layout.tsx`**:
- Título actualizado: `"AfroEventos — El punto de encuentro de nuestra gente"`
- Descripción: `"El punto de encuentro de nuestra gente. Descubre eventos, fiestas, festivales, conciertos y experiencias culturales en una sola plataforma."`
- `openGraph.title` y `openGraph.description` explícitos
- `icons`: SVG con `type: 'image/svg+xml'` + PNG fallback `apple-touch-icon.png`
- JSON-LD `Organization` schema: name, url, logo (`/logo-og.svg`), description — ayuda a Google a mostrar el logo correcto en resultados de búsqueda

**`apps/web-client/src/app/opengraph-image.tsx`** *(nuevo)*:
- Generación de imagen OG server-side con Next.js `ImageResponse` (Satori)
- 1200×630px, fondo negro `#000000`
- Logo SVG (todos los paths con `fill="#6ac44d"`) + texto "AfroEventos" blanco + tagline verde
- Se sirve automáticamente como `og:image` para todas las rutas del web-client

**`apps/web-client/public/favicon.svg`**:
- Agregado `<rect width="680" height="684.4" rx="120" ry="120" fill="#000000"/>` como primer hijo del `<svg>`
- Fondo negro con esquinas redondeadas (~18% del ancho) — estilo app icon moderno

**`apps/web-client/public/logo-og.svg`** *(nuevo)*:
- Copia de `favicon.svg` (mismo fondo negro + rx=120 + paths verdes)
- Referenciado exclusivamente por el JSON-LD Organization logo para Google

**`apps/web-client/public/apple-touch-icon.png`** *(nuevo)*:
- Fuente: `D:\CLIENTESGH\AFROEVENTOS\Logo 2026\AfroFavicon1080x1080.png` (34KB)
- Usado como `apple-touch-icon` (iOS home screen) y como fallback PNG para Slack/Discord/Telegram

**`apps/web-client/public/favicon.ico`** *(eliminado)*:
- El `.ico` antiguo (transparente) tomaba prioridad sobre el `.svg` en navegadores → causaba que producción mostrara el favicon sin fondo negro
- Reemplazado por redirect 301 en `next.config.js`

**`apps/web-client/next.config.js`**:
- Nuevo `async redirects()`: `/favicon.ico` → `/favicon.svg` (permanent: true)
- Garantiza que crawlers y herramientas que buscan `/favicon.ico` reciban el favicon actualizado

#### Commits
- `9c8733f` — feat(web-client): actualizar OG metadata y agregar imagen de preview social
- `d7567c4` — feat(web-client): fondo negro en favicon + structured data para Google
- `5b8beef` — feat(web-client): favicon negro con esquinas redondeadas
- `78adff1` — fix(web-client): favicon negro con esquinas redondeadas en produccion
- `6fc4ba3` — fix(web-client): corregir 3 issues post-analisis de favicon/metadata
- `66ab482` — feat(web-client): agregar apple-touch-icon PNG para iOS y crawlers

#### Estado del sistema de favicon (definitivo)

| Contexto | Archivo | Formato |
| :--- | :--- | :--- |
| Tab navegador (moderno) | `public/favicon.svg` | SVG negro rx=120 |
| iOS "Agregar a pantalla de inicio" | `public/apple-touch-icon.png` | PNG 1080×1080 ✅ |
| Slack / Discord / Telegram | `public/apple-touch-icon.png` | PNG fallback ✅ |
| Google JSON-LD logo | `public/logo-og.svg` | SVG negro rx=120 ✅ |
| Preview social (og:image) | `src/app/opengraph-image.tsx` | PNG 1200×630 generado ✅ |
| `/favicon.ico` (legacy) | redirect 301 → `/favicon.svg` | next.config.js |

#### Notas técnicas
- **Prioridad de favicon en navegadores**: los navegadores prefieren `favicon.ico` sobre SVG por compatibilidad histórica. Eliminar el `.ico` + redirect 301 asegura que el SVG actualizado sea servido.
- **Google Search**: el pequeño ícono circular al lado de la URL en resultados siempre usa el favicon del sitio. La descripción y título en resultados se actualizan cuando Google re-indexa (1-7 días). Usar Google Search Console → "Solicitar indexación" para acelerar.
- **JSON-LD vs favicon**: el JSON-LD `Organization.logo` afecta el Knowledge Panel y datos estructurados de Google, no el favicon en resultados de búsqueda.
- **`opengraph-image.tsx` runtime**: usa Node.js runtime (por defecto, sin `export const runtime = 'edge'`). Compatible con Coolify.

---

### Sesión del 8 de Junio de 2026 (Sesión 21) — Copy UI Web-Client + Puerto web-admin

#### Contexto / objetivo
Actualizar los textos del hero y secciones clave del Portal de Clientes para reflejar mejor la propuesta de valor de AfroEventos. Corregir conflicto de puertos en web-admin para desarrollo local.

#### Cambios realizados

**`apps/web-client/src/app/page.tsx`**:
- Hero headline: `"EL PUNTO DE / ENCUENTRO DE / NUESTRA <span class='accent'>GENTE</span>"` (3 líneas con cortes semánticos, acento en la palabra de mayor peso emocional)
- Hero subtitle: `"Descubre eventos, fiestas, festivales, conciertos y experiencias culturales en una sola plataforma."`

**`apps/web-client/src/app/global.css`**:
- `.hero-split-sub` font-size: `1.05rem` → `1.13rem` (+8%, best practice UX para legibilidad)
- `.octa-sub` font-size: igualado al subtítulo (1.13rem) y luego reducido 8% → `1.04rem`

**`apps/web-client/src/app/eventos/[id]/EventDetailClient.tsx`**:
- CTA de login: `"Inicia sesión para comprar/seleccionar asientos."` → `"Inicia sesión para reservar/comprar entradas."`

**`apps/web-admin/project.json`**:
- Agregado target `dev` explícito con `"command": "next dev --port=4202"`
- Soluciona conflicto: sin este target, Next.js usaba el puerto 3000 por defecto, colisionando con el API NestJS

#### Commit
- `75f2598` — feat(web-client): actualizar copy y tipografía del hero

#### Notas técnicas
- **Headline 3 líneas**: distribución de 3 líneas con corte natural ("DE" al final de cada línea) optimiza la lectura vertical y el acento visual en la palabra final. Sin punto al final de titulares (best practice UX).
- **`rx="120"` en favicon**: 120/680 ≈ 17.6% del ancho — rango estándar de íconos de apps móviles (iOS usa ~22%, Android ~25%).

---

### Sesión del 8 de Junio de 2026 (Sesión 20) — Rate Limiting en API

#### Contexto / objetivo
Activar protección contra fuerza bruta, spam de emails y abuso de compras/uploads. El paquete `@nestjs/throttler` v6 ya estaba instalado y el `ThrottlerGuard` global registrado en `AppModule` con 3 tiers (`short`/`medium`/`long`). Solo faltaban los decoradores específicos en endpoints sensibles y el manejo de 429 en los frontends.

#### Cambios realizados

**`apps/api/src/app/auth/auth.controller.ts`**:
- `POST /auth/login` → `@Throttle({ long: { limit: 10, ttl: 900000 } })` — 10 intentos por IP cada 15 min
- `POST /auth/register` → `@Throttle({ long: { limit: 10, ttl: 3600000 } })` — 10 por IP por hora
- `POST /auth/register-host` → `@Throttle({ long: { limit: 5, ttl: 3600000 } })` — 5 por IP por hora
- `POST /auth/forgot-password` → `@Throttle({ long: { limit: 5, ttl: 900000 } })` — 5 por IP cada 15 min
- `POST /auth/resend-verification` → `@Throttle({ long: { limit: 5, ttl: 900000 } })` — 5 por IP cada 15 min
- `POST /auth/reset-password` → `@Throttle({ long: { limit: 10, ttl: 900000 } })` — 10 por IP cada 15 min

**`apps/api/src/app/orders/orders.controller.ts`**:
- `POST /orders/purchase` → `@Throttle({ medium: { limit: 15, ttl: 60000 } })` — 15 por IP por minuto

**`apps/api/src/app/upload/upload.controller.ts`**:
- `POST /upload` → `@Throttle({ medium: { limit: 20, ttl: 60000 } })` — 20 por IP por minuto (Sharp es CPU-intensivo)

**Frontends — manejo de 429 en español** (en todos los `fetchAPI` y funciones de upload independientes):
- `apps/web-client/src/lib/api.ts` — 2 lugares (`fetchAPI` + `uploadImage`)
- `apps/web-host/src/lib/api.ts` — 3 lugares (`fetchAPI` + 2 funciones de upload)
- `apps/web-admin/lib/api.ts` — 3 lugares (`fetchAPI` + `uploadImage` + `uploadBannerImage`)
- Mensaje genérico: `"Demasiados intentos. Espera unos minutos antes de intentarlo de nuevo."`
- Mensaje de upload: `"Demasiadas subidas. Espera un minuto antes de intentarlo de nuevo."`

#### Notas técnicas
- `@Throttle({ long: { limit: X, ttl: Y } })` sobreescribe solo el throttler `long` para ese endpoint; los throttlers `short` (10/s) y `medium` (60/10s) del módulo siguen activos como protección contra ráfagas.
- El throttling es por IP (comportamiento por defecto de `ThrottlerGuard`). No se implementó throttling por usuario autenticado.
- Todos los demás endpoints (GET públicos, endpoints de admin, etc.) solo tienen los límites globales: 10/s, 60/10s, 200/min.
- Sin cambios de schema ni migrations. Deploy automático en Coolify al pushear a `main`.

---

### Sesión del 5-6 de Junio de 2026 (Sesión 19) — Deuda técnica `eventId` + Sistema de Imágenes (resize/recorte/recomendaciones) + De-dup CSS tickets

#### Contexto / objetivo
Cerrar la deuda técnica del `eventId` codificado solo en el QR JWT (paginación real de asistentes y notificaciones), y rehacer el manejo de imágenes para que encajen bien en todos lados (proporción, recorte, resolución) con información correcta al organizador.

#### Cambios realizados

**1. Deuda técnica `Ticket.eventId` (backend)**
- `libs/shared/prisma/schema.prisma`: `Ticket` gana `eventId String?` (con `@@index`), `zoneName String?`, `seatNumber String?` (nullable por compatibilidad). `prisma db push` aplicado en local.
- `orders.service.ts` `createOrder`: puebla las 3 columnas al crear cada ticket.
- `orders.service.ts` `getMyEventAttendees`: filtra `WHERE eventId IN (...)` en BD (antes cargaba TODOS los tickets de la plataforma y decodificaba todos los JWT). Lee zona/asiento de columnas. Fallback a decodificar JWT para tickets con columna nula (`OR eventId: null`).
- `events.service.ts` `notifyBuyersOfChange`: filtra `WHERE OR[{eventId},{eventId:null}]` en vez de escanear toda la tabla. Mismo fallback JWT.
- `scripts/backfill-ticket-event.js`: backfill idempotente que decodifica el QR (sin verificar firma) y rellena las columnas de tickets antiguos. **Ejecutado en local (95/95 tickets, 0 nulls).**
- ⚠️ **Pendiente en producción (Coolify)**: en el contenedor `afroeventos-api` → `npx prisma db push` + `node scripts/backfill-ticket-event.js`. Sin backfill, los tickets viejos siguen funcionando por el fallback JWT (sin downtime).

**2. Sistema de imágenes — resize server-side por tipo (`apps/api/src/app/upload/upload.controller.ts`)**
- Nuevo mapa `RESIZE_PROFILES` + `resolveResizeProfile(kind, type)`. Sharp ahora redimensiona (no solo comprime a WebP) + `.rotate()` (EXIF).
- Perfiles: `event-square` → **1080×1080** (cover), `event-portrait` → **1200×1600** (cover), `banner`/publicidad → 1600×300 (cover 16:3), `logo`/`avatar` → 400×400 (cover). Sin recorte (solo cap de ancho, preserva proporción): `event-banner` → maxWidth 1600, `event-seatmap` y `event-gallery` → maxWidth 1600. Default sin perfil: cap 1920, sin ampliar.
- Nuevo query param `kind`; si no viene, se infiere de `type` (banner/logo/avatar). **El banner del evento NO se recorta** (es un flyer; se conserva completo a su proporción natural).

**3. Frontend host (`CreateEventForm.tsx`, `EditEventForm.tsx`, `lib/api.ts`)**
- `uploadImage()` acepta `kind` (param final). Los 5 uploads de evento pasan su `kind` (`event-banner|square|portrait|seatmap|gallery`).
- **Aviso de resolución mínima** no bloqueante (`checkMinSize`): lee `naturalWidth/Height` y avisa "podría verse borrosa" si es menor a lo recomendado. Banner valida solo ancho (≥1500), cuadrada 1080×1080, retrato 1200×1600.
- **Etiquetas con tamaño recomendado**: Banner → "horizontal · recomendado 1500×500px — relación 3:1"; Cuadrada → "recomendado 1080×1080px — relación 1:1"; Retrato → "recomendado 1200×1600px — relación 3:4".
- **Preview del banner a proporción natural** (`file-label--natural` / `image-preview--natural`): el contenedor de subida se adapta a la imagen (antes recortaba con un `aspect-ratio` fijo 2000/576).

**4. Frontend cliente — banner a proporción natural (`web-client/global.css`)**
- `.event-detail-hero` (detalle): sin `aspect-ratio` fijo; el banner se muestra completo a su altura natural (`height:auto`).
- `.featured-card-h` (1 destacado): imagen a proporción natural, sin recorte ni bandas (quitado `min-height` + `object-fit:contain`).
- `.featured-card-v-img` (2 destacados) y `.file-label--banner` (host): alineados a `aspect-ratio: 3/1` para coincidir con la recomendación (1500×500). El carrusel de 3+ usa imagen cuadrada (1:1), no se afecta.

**5. Incidente de imágenes (resuelto)**
- Durante una limpieza de prueba se borró `uploads/organizers/temp/` (compartía carpeta con imágenes reales). Recuperadas las versionadas en git; 5 `.webp` no versionados se perdieron → se **vaciaron las referencias muertas** de 2 eventos (usan placeholder). Backup local completo en `D:\AFROEVENTOS\backups\uploads-2026-06-05`.
- **`uploads/` sacado de git tracking** (`git rm -r --cached uploads/`, commit `6536faf`) para alinear con `.gitignore` (`uploads/` ya estaba ignorado; 116 archivos legacy quedaron trackeados por accidente). Producción usa el volumen `afroeventos-uploads`.

**6. De-duplicación de CSS de tickets (`web-client/global.css`)**
- Había estilos de "Mis Tickets" (`.tickets-grid`, `.ticket-*`, `.order-*`, `.qr-*`) **duplicados** en `global.css` y `my-tickets.css` con valores distintos → render no determinista según orden de carga del bundle (la grilla alternaba 2↔3 columnas). Se eliminó el bloque duplicado de `global.css`; `my-tickets.css` queda como única fuente.

#### Estado / verificación
- Typecheck API + web-host (exit 0), build API OK, web-client compila. Backend probado con uploads reales (perfiles correctos). Backfill verificado.
- Cambios **commiteados y pusheados** a `origin/main` en 4 commits: `6536faf` (uploads fuera de git), `1d59812` (eventId), `d492a2f` (imágenes + de-dup CSS), `38b6296`/docs. Pendiente solo en producción: `prisma db push` (automático en el deploy) + `node scripts/backfill-ticket-event.js` en el contenedor API.

---

### Sesión del 3 de Junio de 2026 (Sesión 18) — Validación de Formularios + UX Registro Host

#### Contexto / objetivo
Completar la validación de campos en todos los formularios del proyecto (teléfono sin validación en backend ni frontend) y mejorar la UX del formulario de registro de organizadores en web-host.

#### Cambios realizados

**`libs/shared/src/lib/dto/auth.dto.ts`**:
- Regex compartida `PHONE_REGEX = /^\+?[0-9][\d\s\-()+.]{5,14}$/`
- Decorador `@Matches(PHONE_REGEX)` añadido en los 4 DTOs con campo `phone`: `RegisterDto`, `RegisterHostDto`, `UpdateBasicInfoDto`, `UpdateProfileDto`
- El API ahora rechaza con `400 Bad Request` y mensaje claro cualquier teléfono mal formado

**Frontends — inputs de teléfono**: `type="tel"` + `pattern` + `minLength={7}` + `maxLength={16}` + `title` en:
- `apps/web-client/src/app/register/page.tsx`
- `apps/web-client/src/app/my-profile/page.tsx`
- `apps/web-host/src/app/register/page.tsx`
- `apps/web-admin/app/dashboard/page.tsx` — 4 modales: editar asistente, editar org, crear org, crear/editar usuario admin

**`apps/web-admin/app/login/page.tsx`**: `minLength={6}` añadido al input de contraseña (único login sin él)

**`apps/web-host/src/app/register/page.tsx`** — mejoras UX:
- Campo teléfono: label "Teléfono de Soporte Comercial" → "Teléfono"; layout con prefijo `🇪🇨 +593` separado (consistente con web-client register)
- Botón paso 1: "Continuar a Detalles de Empresa →" → "Continuar a Detalles →"
- Botón paso 3: "Finalizar Registro 🚀" → "Finalizar 🚀"

#### Commits
- `7e1c576` — fix(validation): phone format + password minLength en todo el proyecto
- `c3ad336` — fix(web-host): simplificar etiqueta boton registro paso 1
- `2423aae` — fix(web-host): etiqueta telefono + prefijo +593 en registro organizador
- `1550c07` — fix(web-host): simplificar etiqueta boton finalizar registro

---

### Sesión del 3 de Junio de 2026 (Sesión 17) — UX Responsive Portal Cliente + Admin Login

#### Contexto / objetivo
Mejorar la experiencia en dispositivos móviles y tablets: imagen correcta según orientación, espaciado adecuado en secciones, correcciones de layout en el hero y la sección de destacados, y mejoras de navegación en el panel admin.

#### Cambios realizados

**`apps/web-client/src/app/eventos/[id]/EventDetailClient.tsx`**:
- Hero del detalle de evento: dos `<img>` con clases `.event-detail-hero-banner` (panorámica, siempre visible) y `.event-detail-hero-square` (cuadrada, solo en móvil portrait ≤640px)

**`apps/web-client/src/app/global.css`**:
- `.event-detail h1`: `font-size: clamp(1.75rem, 5vw + 1rem, 3rem)` + `line-height: 1.1` (elimina el gap heredado de `line-height: 1.6` del body)
- `.event-detail-hero-square { display: none }` por defecto; visible con `aspect-ratio: 1/1` y `object-fit: cover` en `@media (max-width: 640px) and (orientation: portrait)`
- Hero carousel: `.hero-split-right { display: none }` en `≤640px`; en `≤960px`: `transform: none` en `.hero-split-left`, `max-width: 600px` en subtítulo, altura `460px`, offsets tarjetas laterales reducidos a `64%`
- Sección Destacados: `padding-left/right: 1.5rem` en `≤960px`; `padding: 2.5rem 1rem 0` en `≤640px`; `.featured-two-grid { grid-template-columns: 1fr }` en móvil
- `.featured-card-h-img img { object-fit: contain }` — banner completo sin recorte, fondo oscuro en áreas vacías

**`apps/web-admin/app/login/page.tsx`**:
- `AfroEventosLogo` envuelto en `<a href={NEXT_PUBLIC_SITE_URL} title="Ir al portal de clientes">` — logo clicable que lleva al Portal de Clientes

**`apps/web-client/src/components/OrganizerCTA.tsx`**:
- Botón principal envuelto en `.octa-cta-group` (div flex-wrap)
- Nuevo botón ghost "Ya tengo cuenta →" → `HOST_URL/login` con `target="_blank" rel="noopener noreferrer"`

#### Commits
- `docs: actualizar handover y checkpoint con Sesiones 16 y 17`

---

### Sesión del 3 de Junio de 2026 (Sesión 16) — Deuda Técnica: .env, findAll, Imágenes, Tipado

#### Contexto / objetivo
Resolver deuda técnica acumulada: seguridad (.env en git), rendimiento (findAll cargando todos los asientos), integridad de datos (imágenes huérfanas en disco) y calidad de código (casts `as any`).

#### Cambios realizados

**Seguridad — `.env` sacado de git tracking**:
- `git rm --cached .env .env.local` — archivos sacados del índice sin borrar localmente
- `.env.example` creado con los 20 nombres de variables y valores placeholder
- ⚠️ Advertencia documentada: JWT_SECRET, MAIL_PASS y credenciales de DB ya estaban en historial de GitHub → deben rotarse externamente en Coolify

**`apps/api/src/app/events/events.service.ts` — findAll optimizado**:
- `GET /events`: reemplaza `seats: { select: { isSold: true } }` por `_count: { select: { seats: { where: { isSold: true } } } }`
- Mapeo de respuesta: `zones.soldCount = _count.seats` (un entero por zona en lugar de N filas)
- `GET /events/:slug` (findOne) sin cambios — sigue cargando seats completos para el mapa interactivo

**`apps/api/src/app/events/events.service.ts` — limpieza de imágenes huérfanas**:
- Constante estática `IMAGE_FIELDS`: los 5 campos de imagen del evento
- `collectImageUrls()`: extrae todas las URLs de imagen de un evento (campos + gallery)
- `deleteOrphanedImageFiles()`: diff de URLs antes/después → borra archivos que ya no están referenciados
- `update()`: snapshot de URLs antes de `prisma.event.update()` → limpieza solo si la escritura fue exitosa
- `remove()`: borra todos los archivos del evento tras `prisma.event.delete()` exitoso

**Eliminación de `as any` (8 casts)**:
- `events.service.ts`: `...eventData` + `status: eventData.status as EventStatus | undefined`; import `EventStatus` de `@prisma/client`
- `admin.service.ts`: `(profile as any).user` → `profile.user`; `(existing as any)._count.orders` → `existing._count.orders`; param `status: any` → `status: HostStatus`
- `admin.controller.ts`: body type `status: 'PENDING' | 'APPROVED' | 'REJECTED'` → `status: HostStatus` (fix colateral: ahora incluye `BLOCKED` que faltaba)
- `orders.service.ts`: `'VALID' as any` → `TicketStatus.VALID`; `(event as any).city` → `event.city`
- `web-admin/components/EditEventForm.tsx`: `portraitImageUrl?: string` añadido a interfaz local; dos casts `(initialData as any)?.portraitImageUrl` → `initialData?.portraitImageUrl`

**`apps/web-client/src/lib/api.ts`**:
- `soldCount?: number` añadido a interfaz `Zone` — campo presente en listado general, ausente en detalle

**`apps/web-client/src/components/EventCard.tsx`**:
- `isEventSoldOut()`: usa `soldCount` cuando no hay `seats[]` (listado) con fallback a array completo (detalle)

#### Commits
- `feat: sacar .env de git tracking + .env.example`
- `perf(api): findAll con _count aggregate — no carga seats en listado`
- `fix(api): limpieza de imágenes huérfanas generalizada`
- `refactor: eliminar as any — enums Prisma en API y admin`

---

### Sesión del 3 de Junio de 2026 (Sesión 15) — Modo Prueba de Organizadores + Kill-Switch de Pagos + UX de Compra

#### Contexto / objetivo
Habilitar un "modo prueba" por organizador (sandbox) para probar el flujo completo de compra de entradas de pago sin contaminar datos reales ni quedar bloqueado por la regla de "no eliminar eventos con tickets vendidos". Además se cerró un hueco del control de pasarela: deshabilitar pagos ahora corta la venta en tiempo real, no solo al crear eventos.

#### Cambios realizados

**Schema Prisma** (`libs/shared/prisma/schema.prisma`):
- Nuevo campo `isTestMode Boolean @default(false)` en `OrganizerProfile` (organizador sandbox)
- `npx prisma db push` ejecutado localmente + en producción (BD ya en sync, columna creada sin afectar datos existentes)

**`apps/api/src/app/admin/admin.service.ts`**:
- `setOrgTestMode(userId, isTestMode)` — marca/desmarca organizador de prueba
- `forceDeleteEvent(eventId)` — borrado en cascada (tickets → órdenes → asientos → zonas → evento). Solo si el dueño es `isTestMode` (si no, `ForbiddenException`). Como tickets/órdenes NO tienen FK al evento, se localizan decodificando el JWT del `qrCodeToken` (campos `eventId`/`seatId`)
- `resetEventSales(eventId)` — libera asientos (`isSold=false`) y borra tickets/órdenes pero conserva evento/zonas/precios. Para repetir pruebas de compra. Solo `isTestMode`
- `getOrganizersAnalytics()` — ahora excluye organizadores en modo prueba (`.filter(org => !org.organizerProfile?.isTestMode)`) para no contaminar ingresos/conteos reales

**`apps/api/src/app/admin/admin.controller.ts`** — Rutas nuevas (solo `Role.ADMIN`): `PATCH /admin/organizers/:id/test-mode`, `DELETE /admin/events/:id/force`, `POST /admin/events/:id/reset-sales`

**`apps/api/src/app/orders/orders.service.ts`** — Kill-switch de pagos en tiempo real: `createOrder` resuelve `paidEventsEnabled` del organizador del evento (helper privado `resolvePaymentEnabled`, override por org → fallback global) y rechaza la compra si el total > $0 y la pasarela está deshabilitada (mensaje en español)

**`apps/web-admin/lib/api.ts`** — Funciones nuevas: `setOrgTestMode`, `forceDeleteEvent`, `resetEventSales`

**`apps/web-admin/app/dashboard/page.tsx`**:
- Handlers `handleToggleOrgTestMode`, `handleForceDeleteEvent`, `handleResetEventSales` (con `showConfirm`)
- Botón 🧪 en cada fila del directorio de organizadores (toggle modo prueba, ADMIN-only)
- Badge "🧪 PRUEBA" junto al estado del organizador y en la fila de cada evento suyo
- En eventos de organizadores de prueba con ventas: botón ♻️ (reset de ventas) y botón 🧪🗑️ (borrado forzado)

**`apps/web-client/src/app/eventos/[id]/EventDetailClient.tsx`** — UX de errores de compra:
- Mapeador `friendlyPurchaseError()` traduce mensajes técnicos del backend (inglés, con UUIDs) a textos claros en español sin exponer IDs
- La notificación de error se reubicó de la columna izquierda (pegada bajo la imagen) a junto al botón Comprar, con estilo de notificación accesible (`role="alert"`, ícono ⚠️, botón ✕ para cerrar)

#### Commit
- `6a13f8a` — feat(admin): modo prueba de organizadores, kill-switch de pagos y UX de compra

#### Notas técnicas
- **🧪 PRUEBA y PAGOS son flags INDEPENDIENTES**: `isTestMode` (badge 🧪) solo excluye de analíticas y habilita reset/borrado forzado; la columna PAGOS (`paidEventsEnabled`: Global/Habilitado/Deshabilitado) decide si se permiten ventas de pago. Para probar una compra completa hay que marcar 🧪 **y** poner PAGOS en Habilitado.
- **Pagos = gate en creación + ahora también en compra**: antes `paidEventsEnabled` solo forzaba precios a $0 al crear/editar eventos; los eventos ya creados con precio seguían siendo comprables aunque se deshabilitara la pasarela. La Sesión 15 agrega la validación en `createOrder` para cortar la venta en tiempo real.
- **Tickets/órdenes sin FK al evento**: la relación vive en el JWT del QR. Por eso `forceDeleteEvent`/`resetEventSales` recorren todos los tickets y decodifican su `qrCodeToken` para atribuirlos al evento (match por `eventId` o `seatId`).
- **Race de puerto en `nx serve api` (Windows)**: al recompilar en watch, el proceso viejo a veces retiene el 3000 y el nuevo falla con `EADDRINUSE`. Solución en dev: matar el proceso del puerto 3000 y relanzar `nx serve api` limpio. No ocurre en producción (cada deploy levanta el proceso desde cero).
- **Migración en producción (Coolify)**: el schema en el contenedor está en la ubicación por defecto `/app/prisma/schema.prisma` (no `libs/shared/prisma/`). Comando: `npx prisma db push --schema=/app/prisma/schema.prisma` (o el corto `npx prisma db push` desde `/app`). Ignorar el aviso "Update available 5.22.0 → 7.8.0" (Prisma está fijado a 5.22.0 a propósito).

---

### Sesión del 2 de Junio de 2026 (Sesión 14) — Sistema de Categorías + Fix Buscador + UI Fixes

#### Cambios realizados

**Schema Prisma** (`libs/shared/prisma/schema.prisma`):
- Nuevo modelo `EventCategory` (id, name unique, icon?, order, isActive, createdAt, updatedAt)
- `npx prisma db push` ejecutado localmente + en producción

**`apps/api/src/app/categories/`** *(nuevo módulo)*:
- `categories.service.ts` — CRUD, seed de 13 categorías por defecto, filtro `withEvents` que excluye destacados activos
- `categories.controller.ts` — GET público con `?withEvents`, GET admin con conteo, POST seed, POST/PATCH/DELETE protegidos
- `categories.module.ts` — registrado en AppModule

**`apps/api/src/app/app.module.ts`** — `CategoriesModule` importado

**`apps/api/src/app/events/events.service.ts`** — `getAvailableCategories()` ahora consulta `EventCategory` (con fallback a groupBy si tabla vacía)

**`apps/api/src/app/auth/auth.service.ts`** — Fix: `login()` distingue "correo no existe" (404) de "contraseña incorrecta" (401 con conteo de intentos)

**`apps/api/src/app/mail/mail.service.ts`** — `encoding: 'utf-8'` explícito en `sendMail`

**`apps/api/src/app/mail/templates/base.layout.ts`** — Fix: entidad HTML `cont&aacute;ctanos` → `contáctanos`

**`apps/web-admin/lib/api.ts`** — Funciones nuevas: `getCategoriesAdmin`, `createCategory`, `updateCategory`, `deleteCategory`, `seedCategories`. Tipo exportado: `EventCategory`

**`apps/web-admin/components/Sidebar.tsx`** — Nuevo ítem "🏷️ Categorías" entre Banners y Usuarios

**`apps/web-admin/app/dashboard/page.tsx`** — `ViewType` y `VALID_VIEWS` ampliados con `'categorias'`. Import de funciones de categorías. Componente `CategoriesView` añadido al final del archivo

**`apps/web-host/src/lib/api.ts`** — Interface `EventCategory` + función `getCategories()` desde `GET /categories`

**`apps/web-host/src/components/CreateEventForm.tsx`** — Reemplaza `EVENT_CATEGORIES` hardcodeado por fetch dinámico a `getCategories()` en `useEffect`

**`apps/web-host/src/components/EditEventForm.tsx`** — Ídem

**`apps/web-client/src/lib/api.ts`** — Interface `EventCategoryItem` (con icon). `getEventCategories()` ahora llama a `GET /categories?withEvents=true`

**`apps/web-client/src/app/page.tsx`**:
- Import `EventCategoryItem`
- `availableCategories` tipado como `EventCategoryItem[]`
- Todos los fetches en paralelo (banners + categorías + eventos en un solo `Promise.all`)
- Pills de categorías con `scroll={false}` (evita salto al top)
- `key={category ?? 'all'}-${query ?? ''}` en `EventsGrid` (reset al cambiar categoría)
- Destacados independientes del filtro: `featuredEvents` viene de `unfilteredData` (sin filtro de categoría)
- Durante búsqueda: `generalEvents = result.data` completo (sin excluir destacados — evita resultados ocultos)

**`apps/web-client/src/components/SearchBar.tsx`** — Reescrito completo:
- `searchParams` eliminado del array de dependencias del `useEffect`
- `useRef(lastPushedRef)` para evitar pushes duplicados
- `useTransition` — ícono de búsqueda se convierte en spinner durante la navegación
- `onKeyDown Escape` limpia y cierra el input
- `router.push` solo cuando el query realmente cambia

**`apps/web-client/src/app/loading.tsx`** *(nuevo)* — Spinner verde con mensaje "Buscando eventos…", mostrado automáticamente por Next.js durante Server Component re-renders

**`apps/web-client/src/app/global.css`**:
- Zoom hover eliminado del banner slider
- `.banner-slider-inner { position: relative }` como anchor para la etiqueta Publicidad
- Pills de categorías rediseñadas: base semi-transparente + hover blanco + active verde + active:hover separado (fix texto negro sobre fondo verde)
- `justify-content: center` en `.category-pills`

**`apps/web-client/src/components/BannerSlider.tsx`** — Etiqueta "Publicidad" con inline styles en esquina inferior derecha, fuera del `overflow: hidden`

#### Commit
- `84b8f1a` — feat: sistema de categorías, fixes de búsqueda y mejoras UI

#### Notas técnicas
- **Filtro `?withEvents=true`**: el `groupBy` que determina qué categorías tienen eventos ahora excluye eventos con `isFeatured=true AND (featuredUntil=null OR featuredUntil>now)`. Esto evita que una pill aparezca vacía cuando el único evento de esa categoría es un destacado.
- **SearchBar `searchParams` en deps**: tener `searchParams` en el array de dependencias del `useEffect` de debounce causaba re-ejecuciones en cascada y múltiples `router.push` al historial. Fix: usar `window.location.search` dentro del timer y `useRef` para comparar el último query enviado.
- **EventsGrid `key` prop**: en Next.js App Router, los Client Components preservan su estado entre navegaciones del mismo árbol. Sin `key`, el grid mantenía los eventos de la categoría anterior aunque `initialEvents` hubiera cambiado. Agregar `key={category}` fuerza una nueva instancia por categoría.

---

### Sesión del 31 de Mayo de 2026 (Sesión 13) — Asistentes Admin, Previsualización, Planes Ocultos, Fix DTO

#### Cambios realizados

**Schema Prisma** (`libs/shared/prisma/schema.prisma`):
- `isBlocked Boolean @default(false)` añadido a `User` — bloquea el login mostrando mensaje de suspensión
- `isHidden Boolean @default(false)` añadido a `Plan` — planes invisibles para organizadores, solo asignables por Admin

**DTO compartido** (`libs/shared/src/lib/dto/events.dto.ts`):
- `portraitImageUrl?: string` añadido a `CreateEventDto` — **fix crítico**: sin este campo el API descartaba silenciosamente la URL de la imagen retrato 3:4 al crear eventos (campo no llegaba a Prisma por `whitelist: true` en ValidationPipe)
- `UpdateEventDto` hereda el campo automáticamente via `PartialType`

**`apps/api/src/app/auth/auth.service.ts`**:
- Check `isBlocked` en `login()`: si `user.isBlocked` → `UnauthorizedException('Tu cuenta ha sido suspendida...')`
- Mensajes de correo duplicado en español en `register()` y `registerHost()` (antes: `'Email already exists'` en inglés)

**`apps/api/src/app/app.service.ts`**:
- `getPlans()` filtra `isHidden: false` — planes ocultos no aparecen en el registro de organizadores

**`apps/api/src/app/admin/admin.service.ts`**:
- `getAttendees(page, limit, search)` — lista paginada de usuarios rol USER con stats: totalTickets, usedTickets, validTickets, totalOrders (calculados via relaciones Prisma sin campo extra en schema)
- `exportAttendees(search)` — igual pero sin paginación, para exportación completa
- `updateAttendee(id, data)` — actualiza name/email/phone con check de email duplicado
- `deleteAttendee(id)` — bloquea eliminación si tiene órdenes (`ForbiddenException`), protege registros financieros
- `blockAttendee(id, isBlocked)` — toggle de suspensión
- `changeAttendeePassword(id, newPassword)` — bcrypt hash + update

**`apps/api/src/app/admin/admin.controller.ts`** — 6 nuevos endpoints:
```
GET  /admin/attendees              ADMIN + EDITOR  lista paginada
GET  /admin/attendees/export       ADMIN + EDITOR  exportar todos (sin paginación)
PATCH /admin/attendees/:id         ADMIN + EDITOR  editar datos
DELETE /admin/attendees/:id        ADMIN           eliminar (bloqueado si tiene órdenes)
PATCH /admin/attendees/:id/block   ADMIN + EDITOR  bloquear/desbloquear
PATCH /admin/attendees/:id/password ADMIN          cambiar contraseña
```
> Nota: `/attendees/export` debe declararse ANTES de `/:id` en el controlador para evitar que NestJS lo interprete como ID.

**`apps/web-admin/components/Sidebar.tsx`**:
- Nuevo ítem "🎟️ Asistentes" visible para ADMIN y EDITOR
- Orden: Inicio → Analíticas → Eventos → Organizadores → Asistentes → Planes (ADMIN only) → Banners → Usuarios (ADMIN only)

**`apps/web-admin/lib/api.ts`** — funciones nuevas: `getAttendees`, `exportAttendees`, `updateAttendee`, `deleteAttendee`, `blockAttendee`, `changeAttendeePassword`

**`apps/web-admin/app/dashboard/page.tsx`** — Vista Asistentes:
- Tabla con columnas: Nombre, Correo, Teléfono, Estado (badge verde/rojo isBlocked), Tickets, Usados, Órdenes, Registro, Acciones
- Búsqueda con debounce, paginación
- Exportación CSV (UTF-8 BOM para Excel) y XLSX (SheetJS lazy import)
- Modal de edición (nombre, email, teléfono) con validación de duplicados
- Modal de cambio de contraseña
- Botón bloquear/desbloquear con confirmación
- Eliminar bloqueado si tiene órdenes: muestra modal informativo en lugar de confirmación de borrado
- Vista Planes: badge "🔒 Solo Admin" naranja para planes `isHidden: true`, badge "✓ Público" verde para visibles; filas con `isHidden` tienen borde naranja y fondo levemente tintado
- Formulario de plan: checkbox `isHidden` con estilo naranja
- Dropdowns de planes en edición/creación de organizadores: muestran todos los planes con sufijo `🔒 (Solo Admin)`

**`apps/web-host/src/components/EventPreviewModal.tsx`** *(nuevo)*:
- Modal full-screen con `createPortal` sobre `document.body`
- Barra naranja fija "👁️ MODO PREVISUALIZACIÓN" con botón cerrar
- Replica el layout completo del Portal de Clientes: hero banner, grid de info, descripción, mapa, video, galería, sidebar de localidades
- Botón de compra desactivado con nota "solo en el Portal de Clientes"
- Badge de estado si el evento es DRAFT o INACTIVE
- Cierra con Esc o clic en "✕ Cerrar"
- Bloquea scroll del body mientras está abierto

**`apps/web-host/src/app/dashboard/page.tsx`**:
- Estado `previewingEvent: any | null`
- Botón "👁️" en cada fila de la tabla de eventos (tono ámbar), visible en cualquier estado del evento
- `<EventPreviewModal>` renderizado condicionalmente al final del componente
- `CreateEventForm` recibe prop `onPreview={(event) => { setPreviewingEvent(event); fetchEvents(); }}`

**`apps/web-host/src/components/CreateEventForm.tsx`**:
- Nueva prop `onPreview?: (event: any) => void`
- Import `updateEvent` añadido
- Estados: `createdEvent`, `publishing`, `published`
- Selector "Estado del Evento" **eliminado** — siempre crea como `DRAFT`
- Pantalla de éxito post-creación con 3 CTAs:
  1. "👁️ Previsualizar evento" (ámbar)
  2. "🚀 Publicar en AfroEventos" (verde — llama `updateEvent(id, { status: 'PUBLISHED' })`)
  3. "← Ir a Mis Eventos sin publicar" (gris)
- Tras publicar exitosamente: botón publish desaparece, estado cambia a "🟢 Publicado — Visible en AfroEventos"

**`apps/web-host/src/components/EditEventForm.tsx`**:
- `portraitImageUrl?: string` añadido a interfaz `EventData`
- `useState` de preview inicializado con `initialData?.portraitImageUrl || ''` (antes usaba `(initialData as any)?.portraitImageUrl` que no propagaba correctamente)
- `let portraitImageUrl = initialData?.portraitImageUrl || ''` corregido igual

**`apps/web-host/src/components/AttendeesList.tsx`**:
- Exportación CSV (UTF-8 BOM) y XLSX (SheetJS) con las mismas columnas del admin
- Filename inteligente: incluye nombre del evento si hay filtro de evento activo
- SheetJS cargado con `import('xlsx')` dinámico (lazy, sin impacto en bundle inicial)

**`apps/web-client/src/app/register/page.tsx`**:
- Alert de correo duplicado incluye enlace "Inicia sesión aquí" cuando el mensaje contiene "ya está registrado"

**`apps/web-host/src/app/register/page.tsx`**:
- Ídem

**`apps/web-client/src/components/Footer.tsx`**:
- Facebook: `https://www.facebook.com/afroeventosec`
- Instagram: `https://www.instagram.com/afroeventosec/`
- WhatsApp: `https://wa.me/593988996579?text=Quiero%20m%C3%A1s%20informaci%C3%B3n`

#### Commits
- `efc09f4` — feat: asistentes admin, preview eventos, correos únicos, redes sociales y fixes

#### Notas técnicas
- **portraitImageUrl bug**: NestJS `ValidationPipe({ whitelist: true })` descarta silenciosamente cualquier campo no declarado en el DTO. El campo `portraitImageUrl` no estaba en `CreateEventDto` → nunca se guardaba en DB. Fix: añadir al DTO compartido en `libs/shared/src/lib/dto/events.dto.ts`
- **Planes ocultos**: endpoint público `GET /api/app/plans` filtra `isHidden: false`. Admin puede crear planes y marcarlos como ocultos; luego asignarlos manualmente a organizadores desde el panel. Los planes ocultos no aparecen en el registro de organizadores.
- **Protección de eliminación de asistentes**: si el asistente tiene órdenes de compra (`_count.orders > 0`), el backend lanza `ForbiddenException` y el frontend muestra un modal informativo (no de confirmación), preservando los registros financieros.

---

### Sesión del 31 de Mayo de 2026 (Sesión 12) — Emails en Producción: Resend SMTP + 12 Plantillas Mejoradas

#### Cambios realizados

**Configuración de Resend SMTP**
- Variables `MAIL_*` agregadas en Coolify (panel Environment Variables del servicio `afroeventos-api`)
- Puerto 465 (SSL) bloqueado por el hosting → se usa **puerto 587 (STARTTLS)** con `MAIL_SECURE=false`
- Variables definitivas en producción:
  ```
  MAIL_HOST=smtp.resend.com
  MAIL_PORT=587
  MAIL_SECURE=false
  MAIL_USER=resend
  MAIL_PASS=<resend_api_key_en_coolify>
  MAIL_FROM=AfroEventos <no-reply@afroeventos.com>
  ```

**`apps/api/src/app/mail/templates/base.layout.ts`** — Reescritura completa:
- `<style>` movido de `<head>` a `<body>` (Gmail elimina los estilos del `<head>`)
- Namespaces VML de Outlook añadidos (`xmlns:v`, `xmlns:o`)
- Metas anti-reformateo para Apple Mail añadidos
- Logo oficial: `<img src="https://afroeventos.com/logo-blanco.svg" width="160" height="57">` centrado en header
- `bgcolor` en todos los `<td>` críticos (fallback Outlook)
- Botones de redes sociales eliminados del footer
- Links reales a `/politicas-de-privacidad`, `/terminos-y-condiciones` y `soporte@afroeventos.com`
- Nueva función exportada `iconCircle(emoji, bgColor, borderColor, size?)` — tabla HTML para círculos de íconos compatibles con Outlook (reemplaza `<div display:inline-block>`)

**Todas las plantillas actualizadas** (12 archivos en `apps/api/src/app/mail/templates/`):
- `welcome-user.template.ts` — `featureRow()` helper migrado a tabla con `bgcolor`
- `welcome-host.template.ts` — `stepRow()` helper migrado a tabla con `bgcolor`
- `verify-email.template.ts` — ícono ✉️ migrado a `iconCircle()`
- `reset-password.template.ts` — ícono 🔑 migrado a `iconCircle()`
- `host-approved.template.ts` — ícono 🎊 migrado a `iconCircle()`
- `host-rejected.template.ts` — ícono 📋 migrado a `iconCircle(size=64)`
- `password-changed.template.ts` — ícono 🔐 migrado a `iconCircle()`
- `event-canceled.template.ts` — ícono ⚠️ migrado a `iconCircle()` + **bug fix**: eliminado `${'???'}` literal que aparecía en emails
- `event-rescheduled.template.ts` — ícono 📅 migrado a `iconCircle()`
- `member-invitation.template.ts` — ícono 🎟️ migrado a `iconCircle()`
- `account-created-by-admin.template.ts` — ícono dinámico `cfg.icon` migrado a `iconCircle(cfg.icon, ...)`

#### Commits
- `0a1fb1f` — feat(mail): apply email best practices and Resend SMTP across all 12 templates

#### Funcionalidad verificada en producción
- forgot-password → email de reset llega correctamente a `dmxwilly@gmail.com`
- reset-password → confirmación de cambio llega correctamente

---

### Sesión del 30 de Mayo de 2026 (Sesión 11) — UI Polish: Precios, Hover Shadows, Logos Clicables

#### Cambios realizados

**`apps/web-client/src/components/EventCard.tsx`**
- Eliminada función `getMinPrice()` y toda la lógica de precio mínimo
- Eliminado el bloque JSX `event-card-footer` / `event-card-price`
- Las tarjetas de eventos en la página principal ya no muestran precios (aplica UX: el precio se descubre en la página de detalle)

**`apps/web-client/src/app/global.css`**
- Reducido gap de `.navbar-links` de `0.5rem` a `0.375rem` (menos espacio entre elementos de navegación)
- Añadidas reglas ID-específicas para neutralizar el padding y hover de los wrappers `<a>` alrededor de los botones auth:
  ```css
  #nav-login, #nav-register, #nav-my-tickets { padding: 0; }
  #nav-login:hover, #nav-register:hover, #nav-my-tickets:hover { background: transparent; }
  ```
- Eliminado `transform: translateY(-2px)` y `box-shadow: 0 4px 12px rgba(0,0,0,0.3)` de `.btn-primary:hover` — eliminada sombra/glow verde alrededor de "Registrarse"
- `.btn-accent:hover` cambiado a `filter: brightness(1.12)` en lugar de fondo oscuro + borde verde

**`apps/web-client/src/components/Footer.tsx`**
- Logo `AfroEventosLogo` en el pie de página envuelto en `<Link href="/" aria-label="Ir al inicio">` — ahora es clicable y lleva a la página de inicio

**`apps/web-host/src/components/Sidebar.tsx`**
- Logo `AfroEventosLogo` envuelto en `<a href={process.env.NEXT_PUBLIC_SITE_URL || 'https://afroeventos.com'} target="_blank" rel="noopener noreferrer">` — clic abre el Portal de Clientes en nueva pestaña

**`apps/web-admin/components/Sidebar.tsx`**
- Mismo patrón de `<a>` que web-host — logo Admin abre el Portal de Clientes en nueva pestaña

**`.gitignore`**
- Añadido `*.tsbuildinfo` bajo sección "compiled output" — los artefactos de build de TypeScript ya no son trackeados por git

#### Commits
- `9ff6fd6` — UI Polish: hover shadows removed, navbar spacing tightened, logos clickable
- `de3d5a6` — .gitignore updated to exclude `*.tsbuildinfo`

#### Causa raíz del glow verde en "Registrarse"
El efecto glow no venía de `box-shadow` directamente en el botón, sino de `.navbar-links a { padding: 0.5rem 1rem }` + `.navbar-links a:hover { background: var(--bg-card-hover) }` aplicándose al `<a>` wrapper que envuelve el `<span>` del botón. Al hacer hover, el fondo oscuro se veía alrededor del `<span>` como un borde/glow. La solución fue usar selectores ID de alta especificidad para anular el padding y el hover en los wrappers específicos.

---

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

### Sesión del 30 de Mayo de 2026 (Sesión 10) — Deploy Completo en Producción

#### Estado final de producción

| Servicio | URL | Estado |
| :--- | :--- | :--- |
| API (NestJS) | `https://api.afroeventos.com/api` | Running |
| Web Client | `https://afroeventos.com` | Running |
| Web Host | `https://host.afroeventos.com` | Running |
| Web Admin | `https://admin.afroeventos.com` | Running |
| PostgreSQL | interno Coolify | Running + schema aplicado |
| Redis | interno Coolify | Running |

#### Problemas resueltos

| Error | Causa | Fix |
| :--- | :--- | :--- |
| `Could not create project graph` en build | `withNx` wrapper en `next.config.js` llama al daemon NX — no disponible en Docker | Removido `withNx`, cambiado a `WORKDIR /app/apps/<app> && RUN npx next build` |
| `useSearchParams() should be wrapped in a suspense boundary` | Next.js App Router require Suspense para páginas que usan `useSearchParams` | Añadido wrapper `<Suspense>` en `reset-password` y `verify-email` en web-client |
| `Cannot find module '/app/server.js'` | Next.js standalone en monorepo coloca `server.js` en `apps/<app>/server.js`, no en la raíz | Corregidas rutas en el runner stage del Dockerfile para los 3 frontends |
| `The table 'public.Event' does not exist` | `prisma migrate deploy` no hace nada sin archivos de migración — las tablas nunca se crean | Cambiado a `prisma db push` en CMD del API Dockerfile (crea schema sin migration files) |
| TypeScript: `eventSlug does not exist in type` | Faltaba campo `eventSlug` en el tipo del Record en `my-tickets/page.tsx` | Añadido `eventSlug: string \| null` al tipo |

#### Archivos modificados (Sesión 10)

| Archivo | Cambio |
| :--- | :--- |
| `apps/api/Dockerfile` | CMD cambiado de `prisma migrate deploy` a `prisma db push` (crea tablas en DB vacía) |
| `apps/web-client/next.config.js` | Removido `withNx`, añadido `output: 'standalone'` |
| `apps/web-host/next.config.js` | Ídem |
| `apps/web-admin/next.config.js` | Ídem |
| `apps/web-client/Dockerfile` | Nuevo — patrón standalone correcto con rutas `apps/web-client/*` |
| `apps/web-host/Dockerfile` | Nuevo — ídem para web-host |
| `apps/web-admin/Dockerfile` | Nuevo — ídem para web-admin |
| `apps/web-client/src/app/reset-password/page.tsx` | Añadido wrapper `<Suspense>` |
| `apps/web-client/src/app/verify-email/page.tsx` | Ídem |
| `apps/web-client/src/app/my-tickets/page.tsx` | Añadido `eventSlug: string \| null` al tipo del Record |

#### Primer admin en producción

Creado directamente en el contenedor de la API (Coolify Terminal):

```bash
node -e "
const { PrismaClient } = require('./node_modules/@prisma/client');
const bcrypt = require('./node_modules/bcrypt');
const prisma = new PrismaClient();
bcrypt.hash('<TU_PASSWORD>', 10).then(hash =>
  prisma.user.create({
    data: { name: 'Blade', email: 'dmxwilly@gmail.com', password: hash, role: 'ADMIN', emailVerified: true }
  })
).then(u => { console.log('Creado:', u.email, u.role); prisma.\$disconnect(); });
"
```

> **Nota**: Para futuros admins, usar el endpoint `POST /api/admin/users` desde el panel admin (requiere estar logueado como ADMIN).

#### URLs de producción verificadas

- `https://afroeventos.com` — Portal de usuarios (abre correctamente, muestra "Aún no hay eventos publicados")
- `https://host.afroeventos.com` — Panel de organizadores (abre)
- `https://admin.afroeventos.com` — Panel de administración (abre, login con `dmxwilly@gmail.com` / `Cybercloud.440440440`)

#### Notas técnicas importantes

- **`prisma db push` vs `prisma migrate deploy`**: Se usa `db push` porque no hay archivos de migración generados. En una DB ya existente con data real, `db push` es seguro mientras no haya cambios destructivos de schema (columns dropped). Si en el futuro se necesita control de migraciones, ejecutar `npx prisma migrate dev --name init` localmente para generar los archivos y volver a `migrate deploy`.
- **NEXT_PUBLIC_* variables**: Deben configurarse en Coolify como "Available at Buildtime" (no solo Runtime) porque se bakean en el JS del cliente durante el `docker build`.
- **Standalone path structure**: Next.js en monorepo NX coloca los archivos del runner en `apps/<appname>/` dentro del directorio standalone. El `server.js` está en `apps/<appname>/server.js`, los estáticos en `apps/<appname>/.next/static/`, y el `public/` en `apps/<appname>/public/`.

---

### Sesión del 30 de Mayo de 2026 (Sesión 9) — Dockerfiles Frontends para Deploy en Coolify

#### Archivos creados/modificados

| Archivo | Cambio |
| :--- | :--- |
| `apps/web-client/Dockerfile` | Nuevo — build NX standalone, ARGs para NEXT_PUBLIC_*, output port 3000 |
| `apps/web-host/Dockerfile` | Nuevo — ídem para web-host |
| `apps/web-admin/Dockerfile` | Nuevo — ídem para web-admin |
| `apps/web-client/next.config.js` | Agregado `output: 'standalone'` |
| `apps/web-host/next.config.js` | Agregado `output: 'standalone'` |
| `apps/web-admin/next.config.js` | Agregado `output: 'standalone'` |

#### Patrón de Dockerfile (igual para los 3)

- **Builder stage**: `node:20-alpine`, instala deps, inyecta `NEXT_PUBLIC_*` como ARGs de build, ejecuta `npx nx build <app> --skip-nx-cache`
- **Runner stage**: `node:20-alpine`, copia `dist/apps/<app>/.next/standalone`, archivos estáticos y `public/`, corre en port 3000
- **Variables NEXT_PUBLIC** baked al build time: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_HOST_URL`, `NEXT_PUBLIC_ADMIN_URL`, `NEXT_PUBLIC_MAX_UPLOAD_MB`, `NEXT_PUBLIC_ALLOWED_IMAGE_TYPES`

#### Instrucciones de deploy en Coolify (para cada frontend)

1. **Crear nuevo servicio** en Coolify → "New Resource" → "Application" → seleccionar el repositorio GitHub
2. **Base Directory**: `/`
3. **Dockerfile Location**: `/apps/web-client/Dockerfile` (o `web-host` / `web-admin`)
4. **Port**: `3000`
5. **Domain**: `afroeventos.com` (o `host.` / `admin.`)
6. **Build Variables** (en pestaña "Build Variables" — no en Environment Variables):

```
NEXT_PUBLIC_API_URL=https://api.afroeventos.com/api
NEXT_PUBLIC_SITE_URL=https://afroeventos.com
NEXT_PUBLIC_HOST_URL=https://host.afroeventos.com
NEXT_PUBLIC_ADMIN_URL=https://admin.afroeventos.com
NEXT_PUBLIC_MAX_UPLOAD_MB=2.5
NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

> **IMPORTANTE**: Los `NEXT_PUBLIC_*` deben ir en **Build Variables** (no en Environment Variables) porque se bakean en el JS del cliente durante el `docker build`. Las Environment Variables de Coolify solo se inyectan en runtime.

#### Errores comunes esperados

| Error | Causa probable | Fix |
| :--- | :--- | :--- |
| `COPY failed: file not found in build context` para `.next/standalone` | `output: 'standalone'` no está en next.config.js | Ya agregado en esta sesión |
| `server.js not found` | La ruta del server.js no coincide con la estructura NX | Verificar que el path sea `apps/web-client/server.js` dentro del standalone |
| Variables NEXT_PUBLIC vacías | Configuradas como Env Vars (runtime) en lugar de Build Args | Mover a Build Variables en Coolify |

---

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
