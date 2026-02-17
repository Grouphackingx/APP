# PROJECT CONTEXT & HANDOVER: OpenTicket (BuenPlan Clone)

**Última Actualización:** 14 de Febrero de 2026
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
│   │       │   ├── page.tsx             # Home: Hero + Catálogo de eventos + Buscador
│   │       │   ├── login/page.tsx       # Formulario de login
│   │       │   ├── register/page.tsx    # Formulario de registro
│   │       │   ├── events/[id]/page.tsx # Detalle + Mapa de asientos interactivo
│   │       │   └── my-tickets/page.tsx  # ✨ NUEVO: Mis Tickets comprados
│   │       ├── components/
│   │       │   ├── Navbar.tsx           # Nav con link "Mis Tickets" (autenticado)
│   │       │   ├── EventCard.tsx        # Card de evento para el catálogo
│   │       │   ├── QRCode.tsx           # ✨ NUEVO: Generador QR real (qrcode lib)
│   │       │   ├── SearchBar.tsx        # ✨ NUEVO: Barra de búsqueda con debounce
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

| Módulo       | Endpoints                                                         | Estado | Descripción                                                        |
| :----------- | :---------------------------------------------------------------- | :----- | :----------------------------------------------------------------- |
| **Auth**     | `POST /auth/login`, `POST /auth/register`                         | ✅     | JWT Bearer tokens, bcrypt hashing                                  |
| **Events**   | `GET /events?q=...`, `GET /events/:id`, `POST /events`            | ✅     | CRUD con zonas, asientos auto-generados, búsqueda por título/lugar |
| **Upload**   | `POST /api/upload`, `GET /uploads/:file`                          | ✅     | Multer disk storage, ServeStatic root `/uploads`                   |
| **Orders**   | `POST /orders/lock-seats`, `POST /orders/purchase`, `GET /orders` | ✅     | Redis locking (10min TTL), transacciones Prisma                    |
| **Payments** | Interno (no HTTP)                                                 | ✅     | Simulación Stripe, siempre aprueba                                 |
| **Tickets**  | `POST /tickets/validate`                                          | ✅     | Decodifica QR JWT, marca USED, previene doble uso                  |
| **Prisma**   | Servicio global                                                   | ✅     | PrismaClient inyectable                                            |
| **Redis**    | Servicio global                                                   | ✅     | ioredis, lock/unlock/getSeatLockHolder                             |

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
- [x] ~~Generar imagen QR real (librería `qrcode`) en la página "Mis Tickets"~~ ✅
- [x] ~~Búsqueda y filtrado de eventos (por fecha, ubicación, categoría)~~ ✅
- [ ] Paginación en endpoints (eventos, órdenes)
- [x] ~~Upload de imágenes de eventos~~ ✅
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

---

## 11. Registro de Cambios Recientes (13-14 Feb 2026)

### Frontend (User Portal)

- **Feature "My Tickets" Finalizada:**
  - Implementada página `/my-tickets` con listado de órdenes y detalle de tickets.
  - Generación de QR en cliente usando librería `qrcode`.
  - Estilos específicos en `my-tickets.css` para evitar conflictos globales.
  - Diseño responsive y "tear-line" visual.
  - QR optimizado para legibilidad (dots negros, fondo blanco, centrado).
- **Mejoras Visuales (Polishing):**
  - **Auth Pages:** Nuevos estilos (`auth.css`) para Login y Register, corrigiendo layout y tarjetas.
  - **Event Detail:** Eliminado estilo de "tarjeta flotante" para integración seamless con la página.
  - **Grid de Tickets:** Ajustado ancho de tarjetas (max 240px) y márgenes para mejor UX.
  - **Global CSS:** Limpieza de reglas conflictivas y duplicadas.

### Backend (API)

- **Orders Endpoint Updated:** `GET /orders` ahora decodifica el token QR para devolver `eventTitle`, `eventDate`, `eventLocation` y detalles de asiento (`zoneName`, `seatNumber`) directamente, facilitando el renderizado en frontend.

## 12. Registro de Cambios Recientes (15-16 Feb 2026)

### Sistema de Pagos

- **Reversión de Stripe:** Se ha revertido la integración de Stripe para priorizar la estabilidad del desarrollo.
  - El sistema usa actualmente el **Mock Payment Service** (siempre aprueba).
  - Eliminada dependencia `@stripe/stripe-js` del flujo principal por ahora.

### Frontend (User Portal)

- **Rediseño de Marca:**
  - Actualizado color primario a un verde más vibrante: `#6AC44D`.
  - Ajustados todos los componentes (botones, badges, links) para usar la nueva paleta.

- **Página de Detalle de Evento (`/events/[id]`):**
  - **Layout de 2 Columnas:** Separación clara entre información del evento (izquierda) y selección de tickets (derecha sticky).
  - **Experiencia Inmersiva:** Eliminado el contenedor tipo "tarjeta" para que el contenido fluya en la página completa.
  - **Mejoras de UI:** Títulos más grandes, grid de información con iconos, y alertas de estado mejoradas.

- **Página de Inicio (Landing):**
  - **Tarjetas de Evento:** Ahora tienen bordes redondeados (`border-radius-lg`), padding interno (`1.5rem`), y efectos de hover/zoom en la imagen.
  - **Tipografía:** Mejor jerarquía visual en títulos y metadatos.

- **Página "Mis Tickets" (`/my-tickets`):**
  - **Agrupación por Evento:** Las órdenes ahora se agrupan por `eventId`.
    - Si un usuario compra varias veces para el mismo evento, se muestra una sola tarjeta consolidada.
    - El total ($) y la cantidad de tickets se suman automáticamente.
  - **Visualización Unificada:** Al expandir, se muestran todos los tickets de todas las órdenes asociadas a ese evento en una sola grid.
# #   1 3 .   R e g i s t r o   d e   C a m b i o s   R e c i e n t e s   ( 1 6   F e b   2 0 2 6   -   S e s i � � n   d e   T a r d e / N o c h e )  
  
 # # #   C a r a c t e r � � s t i c a s   A g r e g a d a s  
  
 -   * * D e s c r i p c i � � n   d e   Z o n a s   d e   E n t r a d a s : * *  
     -   * * S c h e m a : * *   A c t u a l i z a d o   m o d e l o   ` Z o n e `   e n   P r i s m a   p a r a   i n c l u i r   c a m p o   ` d e s c r i p t i o n `   o p c i o n a l .  
     -   * * B a c k e n d : * *   ` E v e n t s S e r v i c e `   a c t u a l i z a d o   p a r a   g u a r d a r   y   r e t o r n a r   l a   d e s c r i p c i � � n .  
     -   * * H o s t   ( C r e a t e   E v e n t ) : * *   F o r m u l a r i o   a c t u a l i z a d o   p a r a   p e r m i t i r   i n g r e s a r   d e s c r i p c i o n e s   p o r   z o n a   ( e j :   " I n c l u y e   b e b i d a " ,   " V i s t a   p a r c i a l " ) .  
     -   * * C l i e n t   ( E v e n t   D e t a i l ) : * *   M u e s t r a   l a   d e s c r i p c i � � n   d e b a j o   d e l   n o m b r e   d e   l a   z o n a   e n   e l   s e l e c t o r   d e   e n t r a d a s .  
  
 # # #   M e j o r a s   d e   E x p e r i e n c i a   d e   U s u a r i o   ( U X / U I )  
  
 -   * * I d e n t i d a d   V i s u a l   p o r   Z o n a : * *  
     -   * * C � � d i g o   d e   C o l o r e s   E s t � � t i c o : * *   I m p l e m e n t a d a   p a l e t a   d e   2 0   c o l o r e s   d e   a l t o   c o n t r a s t e   q u e   s e   a s i g n a n   d e t e r m i n � � s t i c a m e n t e   s e g � � n   e l   n o m b r e   d e   l a   z o n a .  
     -   * * E v e n t   D e t a i l : * *   C � � r c u l o s   d e   c o l o r   i n d i c a d o r e s   j u n t o   a l   n o m b r e   d e   l a   z o n a   y   a s i e n t o s   s e l e c c i o n a d o s   s e   p i n t a n   d e l   c o l o r   d e   s u   z o n a .  
     -   * * M y   T i c k e t s : * *   L a s   t a r j e t a s   d e   t i c k e t s   t i e n e n   u n   b o r d e   s u p e r i o r   d e   c o l o r   y   u n   b a d g e   c o n   e l   c o l o r   d e   s u   z o n a   p a r a   r � � p i d a   i d e n t i f i c a c i � � n .  
  
 -   * * M a n e j o   d e   " A g o t a d o "   ( S o l d   O u t ) : * *  
     -   * * L � � g i c a   V i s u a l : * *   L a s   z o n a s   s i n   a s i e n t o s   d i s p o n i b l e s   s e   m u e s t r a n   c o n   o p a c i d a d   r e d u c i d a .  
     -   * * I n d i c a d o r e s : * *   B a d g e   r o j o   " A G O T A D O "   j u n t o   a l   n o m b r e   y   m e n s a j e   " � � N o   q u e d a n   e n t r a d a s ! "   e n   l u g a r   d e   l o s   c o n t r o l e s   d e   s e l e c c i � � n .  
     -   * * B l o q u e o : * *   D e s h a b i l i t a c i � � n   d e   b o t o n e s   d e   c o m p r a   p a r a   z o n a s   a g o t a d a s .  
  
 -   * * S e l e c t o r   d e   C a n t i d a d   I n t e l i g e n t e : * *  
     -   P a r a   z o n a s   c o n   c a p a c i d a d   >   5 0   ( G e n e r a l ) ,   s e   m u e s t r a   a u t o m � � t i c a m e n t e   u n   s e l e c t o r   n u m � � r i c o   ( + / - )   e n   l u g a r   d e   i n t e n t a r   r e n d e r i z a r   t o d o s   l o s   a s i e n t o s   i n d i v i d u a l e s .  
     -   P a r a   z o n a s   c o n   c a p a c i d a d   < =   5 0   ( N u m e r a d a s ) ,   s e   m a n t i e n e   e l   m a p a   d e   s e l e c c i � � n   d e   a s i e n t o s   i n d i v i d u a l .  
  
 -   * * M i c r o - c o p y : * *  
     -   A c t u a l i z a d o   t e x t o   C T A   a   " S e l e c c i o n a   t u s   e n t r a d a s / a s i e n t o s   a r r i b a "   p a r a   m a y o r   c l a r i d a d .  
 