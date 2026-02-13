# PROJECT CONTEXT & HANDOVER: OpenTicket (BuenPlan Clone)

**Última Actualización:** 12 de Febrero de 2026
**Estado del Proyecto:** ✅ Fases 1, 2 y 3 Completadas y Verificadas
**Propósito:** Carga instantánea de contexto para modelos de IA o desarrolladores.

---

## 1. Visión del Proyecto

**OpenTicket** es un sistema de venta y gestión de entradas para eventos (marketplace de dos lados), que replica la funcionalidad de `buenplan.com.ec`.

### Actores del Sistema

| Rol                    | Descripción                                                                                 | Interface          |
| :--------------------- | :------------------------------------------------------------------------------------------ | :----------------- |
| **Host (Organizador)** | Crea eventos, gestiona zonas/asientos, ve reportes financieros                              | Web Host (:4201)   |
| **User (Asistente)**   | Descubre eventos, compra tickets (selecciona asientos), recibe QR dinámicos, ve sus tickets | Web Client (:4200) |
| **Staff (Validador)**  | Escanea códigos QR en la puerta usando la App Móvil                                         | Mobile App (Expo)  |
| **Admin**              | Gestión global de la plataforma                                                             | (Pendiente)        |

---

## 2. Stack Tecnológico

| Capa                | Tecnología                         | Detalle                                      |
| :------------------ | :--------------------------------- | :------------------------------------------- |
| **Monorepo**        | Nx (Integrated Repo)               | Gestión de workspace, builds y dev servers   |
| **Lenguaje**        | TypeScript                         | Modo estricto con decoradores experimentales |
| **Backend**         | NestJS (Node.js)                   | API RESTful en puerto 3000                   |
| **Frontend (User)** | Next.js 16 (App Router, Turbopack) | Portal de usuario en puerto 4200             |
| **Frontend (Host)** | Next.js 16 (App Router, Turbopack) | Dashboard de organizador en puerto 4201      |
| **Mobile**          | React Native (Expo)                | App de validación QR para staff              |
| **Base de Datos**   | PostgreSQL 15                      | Containerizado en puerto 5435                |
| **Cache/Locks**     | Redis 7                            | Containerizado en puerto 6380                |
| **ORM**             | Prisma 5.22.0                      | Schema como fuente de verdad                 |
| **Infra**           | Docker Compose                     | PostgreSQL + Redis                           |
| **Pagos**           | Stripe (simulado)                  | Módulo mock, siempre aprueba                 |

---

## 3. Arquitectura Actual (Fases 1-3 Completas)

### Estructura de Carpetas

```text
/
├── apps/
│   ├── api/                     # ✅ Port 3000. NestJS Backend.
│   │   └── src/app/
│   │       ├── auth/            # Login JWT, Registro, Guards
│   │       ├── events/          # CRUD de Eventos con Zonas y Asientos
│   │       ├── orders/          # Lock de asientos, Compra, Tickets QR
│   │       ├── payments/        # Stripe simulado
│   │       ├── tickets/         # Validación de QR (VALID → USED)
│   │       ├── prisma/          # PrismaService
│   │       └── redis/           # RedisService (ioredis)
│   │
│   ├── web-client/              # ✅ Port 4200. Next.js Portal de Usuario.
│   │   └── src/
│   │       ├── app/
│   │       │   ├── page.tsx             # Home: Hero + Catálogo de eventos
│   │       │   ├── login/page.tsx       # Formulario de login
│   │       │   ├── register/page.tsx    # Formulario de registro
│   │       │   ├── events/[id]/page.tsx # Detalle + Mapa de asientos interactivo
│   │       │   └── my-tickets/page.tsx  # ✨ NUEVO: Mis Tickets comprados
│   │       ├── components/
│   │       │   ├── Navbar.tsx           # Nav con link "Mis Tickets" (autenticado)
│   │       │   ├── EventCard.tsx        # Card de evento para el catálogo
│   │       │   ├── Footer.tsx           # Footer global
│   │       │   └── Providers.tsx        # AuthProvider wrapper
│   │       └── lib/
│   │           ├── AuthContext.tsx       # Context de JWT + localStorage
│   │           └── api.ts               # Funciones fetch para todos los endpoints
│   │
│   ├── web-host/                # ✅ Port 4201. Next.js Dashboard Organizador.
│   │   └── src/
│   │       ├── app/
│   │       │   ├── page.tsx             # AuthGate → Login o Dashboard
│   │       │   ├── login/LoginPage.tsx  # Login para organizadores
│   │       │   └── dashboard/           # Dashboard con stats y tabla de eventos
│   │       ├── components/
│   │       │   ├── Sidebar.tsx          # Navegación lateral
│   │       │   └── CreateEventForm.tsx  # Formulario de creación de eventos
│   │       └── lib/
│   │           ├── AuthContext.tsx       # Context separado (ot_host_token)
│   │           └── api.ts               # API client para host
│   │
│   └── mobile-app/              # ✅ Expo App. Validador de QR para Staff.
│       └── src/app/
│           ├── App.tsx                  # Auth state + Navigation
│           ├── screens/
│           │   ├── LoginScreen.tsx      # Login para staff
│           │   └── ScannerScreen.tsx    # Cámara + QR Scanner
│           └── services/
│               └── api.ts               # API client para mobile
│
├── libs/
│   ├── shared/                  # ✅ Librería compartida
│   │   ├── prisma/schema.prisma # Schema de BD (FUENTE DE VERDAD)
│   │   └── src/lib/dto/         # DTOs: LoginDto, RegisterDto, CreateEventDto, etc.
│   └── ui-kit/                  # 📝 Scaffolded (sin uso aún)
│
├── scripts/
│   └── seed-roles.js            # Script para asignar roles HOST/STAFF
│
├── docs/
│   ├── PROJECT_CONTEXT_HANDOVER.md  # Este archivo
│   └── CHECKPOINT_RESTORE.md        # Guía rápida de inicio
│
├── docker-compose.yml           # PostgreSQL 15 + Redis 7
├── .env                         # Variables de entorno
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
```

---

## 4. Funcionalidades Implementadas

### A. Backend (NestJS API) — 7 módulos

| Módulo       | Endpoints                                                                                      | Estado | Descripción                                       |
| :----------- | :--------------------------------------------------------------------------------------------- | :----- | :------------------------------------------------ |
| **Auth**     | `POST /auth/login`, `POST /auth/register`                                                      | ✅     | JWT Bearer tokens, bcrypt hashing                 |
| **Events**   | `GET /events`, `GET /events/:id`, `POST /events`                                               | ✅     | CRUD con zonas, asientos auto-generados           |
| **Orders**   | `POST /orders/lock-seats`, `POST /orders/unlock-seats`, `POST /orders/purchase`, `GET /orders` | ✅     | Redis locking (10min TTL), transacciones Prisma   |
| **Payments** | Interno (no HTTP)                                                                              | ✅     | Simulación Stripe, siempre aprueba                |
| **Tickets**  | `POST /tickets/validate`                                                                       | ✅     | Decodifica QR JWT, marca USED, previene doble uso |
| **Prisma**   | Servicio global                                                                                | ✅     | PrismaClient inyectable                           |
| **Redis**    | Servicio global                                                                                | ✅     | ioredis, lock/unlock/getSeatLockHolder            |

### B. Frontend Web Client (Next.js) — 5 páginas

| Ruta           | Componente             | Estado       | Descripción                                                |
| :------------- | :--------------------- | :----------- | :--------------------------------------------------------- |
| `/`            | `page.tsx`             | ✅           | Hero animado + catálogo de eventos en grid                 |
| `/login`       | `login/page.tsx`       | ✅           | Formulario de login con JWT                                |
| `/register`    | `register/page.tsx`    | ✅           | Formulario de registro                                     |
| `/events/[id]` | `events/[id]/page.tsx` | ✅           | Detalle del evento + mapa de asientos interactivo + compra |
| `/my-tickets`  | `my-tickets/page.tsx`  | ✅ **NUEVO** | Mis órdenes y tickets con zona, asiento, estado, QR        |

**Características UI:**

- Tema oscuro premium con glassmorphism y gradientes
- Tipografía: Inter + Space Grotesk (Google Fonts)
- Animaciones CSS staggered (fadeInUp)
- Navbar con autenticación (muestra nombre, botón "Mis Tickets", logout)
- Mapa de asientos interactivo con estados: disponible (verde), seleccionado (morado), vendido (gris)
- Barra inferior de compra con total y cuenta de asientos
- Página "Mis Tickets" con stats, órdenes expandibles, tarjetas de ticket con tear-line, badges de estado

### C. Frontend Web Host (Next.js) — 2 vistas

| Vista        | Componente                    | Estado | Descripción                                                    |
| :----------- | :---------------------------- | :----- | :------------------------------------------------------------- |
| Login        | `login/LoginPage.tsx`         | ✅     | Login exclusivo para organizadores                             |
| Dashboard    | `dashboard/DashboardPage.tsx` | ✅     | Stats (eventos, tickets vendidos, ingresos) + tabla de eventos |
| Crear Evento | `CreateEventForm.tsx`         | ✅     | Formulario con zonas dinámicas (nombre, precio, capacidad)     |

**Características UI:**

- Tema oscuro con sidebar lateral
- Stats cards (Eventos Creados, Tickets Vendidos, Asientos Totales, Ingresos)
- Tabla de eventos con estado (Publicado/Borrador)

### D. Mobile App (React Native / Expo) — 2 pantallas

| Pantalla | Archivo             | Estado | Descripción                       |
| :------- | :------------------ | :----- | :-------------------------------- |
| Login    | `LoginScreen.tsx`   | ✅     | Autenticación para staff          |
| Scanner  | `ScannerScreen.tsx` | ✅     | Cámara QR + validación contra API |

---

## 5. Schema de Base de Datos (Prisma)

```prisma
enum Role      { USER, HOST, ADMIN, STAFF }
enum EventStatus { DRAFT, PUBLISHED, CANCELLED, COMPLETED }
enum TicketStatus { VALID, USED, REFUNDED }

model User {
  id, email (unique), password (bcrypt), name, role (default USER)
  → eventsOwned Event[], orders Order[]
}

model Event {
  id, title, description?, date, location, imageUrl?, status (default DRAFT)
  → organizer User, zones Zone[]
}

model Zone {
  id, eventId → Event, name, price (Decimal), capacity, isReservedSeating
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
  id, orderId → Order, qrCodeToken (unique), status (default VALID), scannedAt?
}
```

**Nota:** El `Ticket` no tiene relación directa con `Seat`. La información del asiento (zona, número, evento) se codifica dentro del QR JWT token y se decodifica en el endpoint `GET /orders` para enriquecer la respuesta.

---

## 6. Flujos de Negocio Verificados

### Flujo de Compra (End-to-End) ✅

```
Usuario selecciona asientos → POST /orders/lock-seats (Redis TTL 10min)
→ POST /orders/purchase → Stripe mock → Prisma transaction:
  [Seats marked sold + Order created + Tickets with QR JWT created]
→ Redis locks released → Response with tickets & QR tokens
```

### Flujo de Validación QR ✅

```
Staff escanea QR → POST /tickets/validate (token JWT)
→ JWT decoded → Ticket found in DB → Status check:
  - VALID → Mark as USED, set scannedAt → ✅ "Acceso Permitido"
  - USED → ❌ "Este ticket YA FUE USADO anteriormente"
```

### Flujo de "Mis Tickets" ✅

```
Usuario logueado → GET /orders (JWT)
→ Backend: Fetch orders + tickets → Decode cada QR JWT
→ Fetch event info (título, fecha, ubicación) desde DB
→ Response enriquecida con eventTitle, zoneName, seatNumber por ticket
```

---

## 7. Datos de Prueba

| Rol       | Email                    | Password     | Función                  |
| :-------- | :----------------------- | :----------- | :----------------------- |
| **Host**  | `admin@openticket.com`   | `admin123`   | Crear eventos en `:4201` |
| **User**  | `cliente@openticket.com` | `cliente123` | Comprar en `:4200`       |
| **Staff** | `staff@openticket.com`   | `staff123`   | Validar QR en Mobile App |

**Script de seed:** `node scripts/seed-roles.js` (actualiza roles de USER → HOST/STAFF)

---

## 8. Guía Operativa (Cómo Iniciar)

```powershell
# 1. Infraestructura
docker-compose up -d

# 2. Prisma (solo primera vez o tras cambios de schema)
npx prisma generate --schema=libs/shared/prisma/schema.prisma
npx prisma db push --schema=libs/shared/prisma/schema.prisma

# 3. API (Terminal 1)
npx nx serve api --no-dte

# 4. Web Client (Terminal 2)
npx nx dev web-client --no-dte

# 5. Web Host (Terminal 3 — desde apps/web-host/)
npx next dev --port=4201

# 6. Mobile App (Terminal 4 — opcional)
cd apps/mobile-app && npx expo start
```

---

## 9. Roadmap (Próximos Pasos)

### Fase 4: Mejoras de Producción

- [ ] Integración real con Stripe (configurar `STRIPE_SECRET_KEY`)
- [ ] Panel de Admin (gestión global)
- [ ] Reportes financieros para organizadores
- [ ] Emails transaccionales (confirmación de compra)
- [ ] Generar imagen QR real (librería `qrcode`) en la página "Mis Tickets"
- [ ] Búsqueda y filtrado de eventos (por fecha, ubicación, categoría)
- [ ] Paginación en endpoints (eventos, órdenes)
- [ ] Upload de imágenes de eventos
- [ ] Sistema de categorías de eventos

### Fase 5: Escalabilidad

- [ ] Rate limiting en API
- [ ] Websockets para actualizaciones en tiempo real del mapa de asientos
- [ ] CDN para imágenes
- [ ] CI/CD pipeline
- [ ] Tests unitarios e integración

---

## 10. Problemas Conocidos / Notas

- **Puertos no estándar**: PostgreSQL en 5435, Redis en 6380 (para evitar conflictos).
- **Prisma 5.22.0**: Versión bloqueada por incompatibilidades de CLI con v7+.
- **Pagos simulados**: El módulo `PaymentsService` siempre retorna `true`. Necesita integración real con Stripe para producción.
- **Web Host TUI**: `npx nx dev web-host` puede fallar en la TUI interactiva de Nx. Usar `npx next dev --port=4201` directamente desde `apps/web-host/`.
- **Webpack NestJS**: Usa `npx -y webpack-cli` en `project.json` para asegurar que el build encuentra el CLI.
- **Ticket sin relación a Seat**: El modelo `Ticket` no tiene `seatId`. La info del asiento se codifica en el QR JWT y se decodifica en runtime para el endpoint `GET /orders`.
- **Evento "Borrador"**: Los eventos se crean con status `DRAFT` excepto cuando se especifica `PUBLISHED` en el body.
