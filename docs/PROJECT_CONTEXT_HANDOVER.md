# PROJECT CONTEXT & HANDOVER: OpenTicket (BuenPlan Clone)

**Ãšltima Actualización:** 31 de Marzo de 2026
**Estado del Proyecto:** âœ… Fases 1, 2 y 3 Completadas y Verificadas
**PropÃ³sito:** Carga instantÃ¡nea de contexto para modelos de IA o desarrolladores.

---

## 1. VisiÃ³n del Proyecto

**OpenTicket** es un sistema de venta y gestiÃ³n de entradas para eventos (marketplace de dos lados), que replica la funcionalidad de `buenplan.com.ec`.

### Actores del Sistema

| Rol                    | DescripciÃ³n                                                                                 | Interface          |
| :--------------------- | :------------------------------------------------------------------------------------------ | :----------------- |
| **Host (Organizador)** | Crea eventos, gestiona zonas/asientos, ve reportes financieros                              | Web Host (:4201)   |
| **User (Asistente)**   | Descubre eventos, compra tickets (selecciona asientos), recibe QR dinÃ¡micos, ve sus tickets | Web Client (:4200) |
| **Staff (Validador)**  | Escanea cÃ³digos QR en la puerta usando la App MÃ³vil                                         | Mobile App (Expo)  |
| **Admin**              | GestiÃ³n global de la plataforma                                                             | (Pendiente)        |

---

## 2. Stack TecnolÃ³gico

| Capa                | TecnologÃ­a                         | Detalle                                      |
| :------------------ | :--------------------------------- | :------------------------------------------- |
| **Monorepo**        | Nx (Integrated Repo)               | GestiÃ³n de workspace, builds y dev servers   |
| **Lenguaje**        | TypeScript                         | Modo estricto con decoradores experimentales |
| **Backend**         | NestJS (Node.js)                   | API RESTful en puerto 3000                   |
| **Frontend (User)** | Next.js 16 (App Router, Turbopack) | Portal de usuario en puerto 4200             |
| **Frontend (Host)** | Next.js 16 (App Router, Turbopack) | Dashboard de organizador en puerto 4201      |
| **Mobile**          | React Native (Expo)                | App de validaciÃ³n QR para staff              |
| **Base de Datos**   | PostgreSQL 15                      | Containerizado en puerto 5435                |
| **Cache/Locks**     | Redis 7                            | Containerizado en puerto 6380                |
| **ORM**             | Prisma 5.22.0                      | Schema como fuente de verdad                 |
| **Infra**           | Docker Compose                     | PostgreSQL + Redis                           |
| **Pagos**           | Stripe (simulado)                  | MÃ³dulo mock, siempre aprueba                 |

---

## 3. Arquitectura Actual (Fases 1-3 Completas)

### Estructura de Carpetas

```text
/
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ api/                     # âœ… Port 3000. NestJS Backend.
â”‚   â”‚   â””â”€â”€ src/app/
â”‚   â”‚       â”œâ”€â”€ auth/            # Login JWT, Registro, Guards
â”‚   â”‚       â”œâ”€â”€ events/          # CRUD de Eventos con Zonas y Asientos
â”‚   â”‚       â”œâ”€â”€ orders/          # Lock de asientos, Compra, Tickets QR
â”‚   â”‚       â”œâ”€â”€ payments/        # Stripe simulado
â”‚   â”‚       â”œâ”€â”€ tickets/         # ValidaciÃ³n de QR (VALID â†’ USED)
â”‚   â”‚       â”œâ”€â”€ prisma/          # PrismaService
â”‚   â”‚       â””â”€â”€ redis/           # RedisService (ioredis)
â”‚   â”‚
â”‚   â”œâ”€â”€ web-client/              # âœ… Port 4200. Next.js Portal de Usuario.
â”‚   â”‚   â””â”€â”€ src/
â”‚   â”‚       â”œâ”€â”€ app/
â”‚   â”‚       â”‚   â”œâ”€â”€ page.tsx             # Home: Hero + CatÃ¡logo de eventos + Buscador
â”‚   â”‚       â”‚   â”œâ”€â”€ login/page.tsx       # Formulario de login
â”‚   â”‚       â”‚   â”œâ”€â”€ register/page.tsx    # Formulario de registro
â”‚   â”‚       â”‚   â”œâ”€â”€ events/[id]/page.tsx # Detalle + Mapa de asientos interactivo
â”‚   â”‚       â”‚   â””â”€â”€ my-tickets/page.tsx  # âœ¨ NUEVO: Mis Tickets comprados
â”‚   â”‚       â”œâ”€â”€ components/
â”‚   â”‚       â”‚   â”œâ”€â”€ Navbar.tsx           # Nav con link "Mis Tickets" (autenticado)
â”‚   â”‚       â”‚   â”œâ”€â”€ EventCard.tsx        # Card de evento para el catÃ¡logo
â”‚   â”‚       â”‚   â”œâ”€â”€ QRCode.tsx           # âœ¨ NUEVO: Generador QR real (qrcode lib)
â”‚   â”‚       â”‚   â”œâ”€â”€ SearchBar.tsx        # âœ¨ NUEVO: Barra de bÃºsqueda con debounce
â”‚   â”‚       â”‚   â”œâ”€â”€ Footer.tsx           # Footer global
â”‚   â”‚       â”‚   â””â”€â”€ Providers.tsx        # AuthProvider wrapper
â”‚   â”‚       â””â”€â”€ lib/
â”‚   â”‚           â”œâ”€â”€ AuthContext.tsx       # Context de JWT + localStorage
â”‚   â”‚           â””â”€â”€ api.ts               # Funciones fetch para todos los endpoints
â”‚   â”‚
â”‚   â”œâ”€â”€ web-host/                # âœ… Port 4201. Next.js Dashboard Organizador.
â”‚   â”‚   â””â”€â”€ src/
â”‚   â”‚       â”œâ”€â”€ app/
â”‚   â”‚       â”‚   â”œâ”€â”€ page.tsx             # AuthGate â†’ Login o Dashboard
â”‚   â”‚       â”‚   â”œâ”€â”€ login/LoginPage.tsx  # Login para organizadores
â”‚   â”‚       â”‚   â””â”€â”€ dashboard/           # Dashboard con stats y tabla de eventos
â”‚   â”‚       â”œâ”€â”€ components/
â”‚   â”‚       â”‚   â”œâ”€â”€ Sidebar.tsx          # NavegaciÃ³n lateral
â”‚   â”‚       â”‚   â””â”€â”€ CreateEventForm.tsx  # Formulario de creaciÃ³n de eventos
â”‚   â”‚       â””â”€â”€ lib/
â”‚   â”‚           â”œâ”€â”€ AuthContext.tsx       # Context separado (ot_host_token)
â”‚   â”‚           â””â”€â”€ api.ts               # API client para host
â”‚   â”‚
â”‚   â””â”€â”€ mobile-app/              # âœ… Expo App. Validador de QR para Staff.
â”‚       â””â”€â”€ src/app/
â”‚           â”œâ”€â”€ App.tsx                  # Auth state + Navigation
â”‚           â”œâ”€â”€ screens/
â”‚           â”‚   â”œâ”€â”€ LoginScreen.tsx      # Login para staff
â”‚           â”‚   â””â”€â”€ ScannerScreen.tsx    # CÃ¡mara + QR Scanner
â”‚           â””â”€â”€ services/
â”‚               â””â”€â”€ api.ts               # API client para mobile
â”‚
â”œâ”€â”€ libs/
â”‚   â”œâ”€â”€ shared/                  # âœ… LibrerÃ­a compartida
â”‚   â”‚   â”œâ”€â”€ prisma/schema.prisma # Schema de BD (FUENTE DE VERDAD)
â”‚   â”‚   â””â”€â”€ src/lib/dto/         # DTOs: LoginDto, RegisterDto, CreateEventDto, etc.
â”‚   â””â”€â”€ ui-kit/                  # ðŸ“ Scaffolded (sin uso aÃºn)
â”‚
â”œâ”€â”€ scripts/
â”‚   â””â”€â”€ seed-roles.js            # Script para asignar roles HOST/STAFF
â”‚
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ PROJECT_CONTEXT_HANDOVER.md  # Este archivo
â”‚   â””â”€â”€ CHECKPOINT_RESTORE.md        # GuÃ­a rÃ¡pida de inicio
â”‚
â”œâ”€â”€ docker-compose.yml           # PostgreSQL 15 + Redis 7
â”œâ”€â”€ .env                         # Variables de entorno
â””â”€â”€ tsconfig.base.json           # Paths: @open-ticket/shared, @open-ticket/ui-kit
```

### Infraestructura (Docker)

| Servicio          | Puerto             | Credenciales                                  |
| :---------------- | :----------------- | :-------------------------------------------- |
| **PostgreSQL 15** | 5435 (no estÃ¡ndar) | `postgres` / `password` / DB: `openticket_db` |
| **Redis 7**       | 6380 (no estÃ¡ndar) | Sin password                                  |

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

### A. Backend (NestJS API) â€” 7 mÃ³dulos

| MÃ³dulo       | Endpoints                                                         | Estado | DescripciÃ³n                                                        |
| :----------- | :---------------------------------------------------------------- | :----- | :----------------------------------------------------------------- |
| **Auth**     | `POST /auth/login`, `POST /auth/register`                         | âœ…     | JWT Bearer tokens, bcrypt hashing                                  |
| **Events**   | `GET /events?q=...`, `GET /events/:id`, `POST /events`            | âœ…     | CRUD con zonas, asientos auto-generados, bÃºsqueda por tÃ­tulo/lugar |
| **Upload**   | `POST /api/upload`, `GET /uploads/:file`                          | âœ…     | Multer disk storage, ServeStatic root `/uploads`                   |
| **Orders**   | `POST /orders/lock-seats`, `POST /orders/purchase`, `GET /orders` | âœ…     | Redis locking (10min TTL), transacciones Prisma                    |
| **Payments** | Interno (no HTTP)                                                 | âœ…     | SimulaciÃ³n Stripe, siempre aprueba                                 |
| **Tickets**  | `POST /tickets/validate`                                          | âœ…     | Decodifica QR JWT, marca USED, previene doble uso                  |
| **Prisma**   | Servicio global                                                   | âœ…     | PrismaClient inyectable                                            |
| **Redis**    | Servicio global                                                   | âœ…     | ioredis, lock/unlock/getSeatLockHolder                             |

### B. Frontend Web Client (Next.js) â€” 5 pÃ¡ginas

| Ruta           | Componente             | Estado       | DescripciÃ³n                                                |
| :------------- | :--------------------- | :----------- | :--------------------------------------------------------- |
| `/`            | `page.tsx`             | âœ…           | Hero animado + catÃ¡logo de eventos en grid                 |
| `/login`       | `login/page.tsx`       | âœ…           | Formulario de login con JWT                                |
| `/register`    | `register/page.tsx`    | âœ…           | Formulario de registro                                     |
| `/events/[id]` | `events/[id]/page.tsx` | âœ…           | Detalle del evento + mapa de asientos interactivo + compra |
| `/my-tickets`  | `my-tickets/page.tsx`  | âœ… **NUEVO** | Mis Ã³rdenes y tickets con zona, asiento, estado, QR        |

**CaracterÃ­sticas UI:**

- Tema oscuro premium con glassmorphism y gradientes
- TipografÃ­a: Inter + Space Grotesk (Google Fonts)
- Animaciones CSS staggered (fadeInUp)
- Navbar con autenticaciÃ³n (muestra nombre, botÃ³n "Mis Tickets", logout)
- Mapa de asientos interactivo con estados: disponible (verde), seleccionado (morado), vendido (gris)
- Barra inferior de compra con total y cuenta de asientos
- PÃ¡gina "Mis Tickets" con stats, Ã³rdenes expandibles, tarjetas de ticket con tear-line, badges de estado

### C. Frontend Web Host (Next.js) â€” 2 vistas

| Vista        | Componente                    | Estado | DescripciÃ³n                                                    |
| :----------- | :---------------------------- | :----- | :------------------------------------------------------------- |
| Login        | `login/LoginPage.tsx`         | âœ…     | Login exclusivo para organizadores                             |
| Dashboard    | `dashboard/DashboardPage.tsx` | âœ…     | Stats (eventos, tickets vendidos, ingresos) + tabla de eventos |
| Crear Evento | `CreateEventForm.tsx`         | âœ…     | Formulario con zonas dinÃ¡micas (nombre, precio, capacidad)     |

**CaracterÃ­sticas UI:**

- Tema oscuro con sidebar lateral
- Stats cards (Eventos Creados, Tickets Vendidos, Asientos Totales, Ingresos)
- Tabla de eventos con estado (Publicado/Borrador)

### D. Mobile App (React Native / Expo) â€” 2 pantallas

| Pantalla | Archivo             | Estado | DescripciÃ³n                       |
| :------- | :------------------ | :----- | :-------------------------------- |
| Login    | `LoginScreen.tsx`   | âœ…     | AutenticaciÃ³n para staff          |
| Scanner  | `ScannerScreen.tsx` | âœ…     | CÃ¡mara QR + validaciÃ³n contra API |

---

## 5. Schema de Base de Datos (Prisma)

```prisma
enum Role      { USER, HOST, ADMIN, STAFF }
enum EventStatus { DRAFT, PUBLISHED, CANCELLED, COMPLETED }
enum TicketStatus { VALID, USED, REFUNDED }

model User {
  id, email (unique), password (bcrypt), name, role (default USER)
  â†’ eventsOwned Event[], orders Order[]
}

model Event {
  id, title, description?, date, location, imageUrl?, status (default DRAFT)
  â†’ organizer User, zones Zone[]
}

model Zone {
  id, eventId â†’ Event, name, price (Decimal), capacity, isReservedSeating
  â†’ seats Seat[]
}

model Seat {
  id, zoneId â†’ Zone, row?, number?, isSold (default false)
}

model Order {
  id, userId â†’ User, totalAmount (Decimal), status, paymentRef?
  â†’ tickets Ticket[]
}

model Ticket {
  id, orderId â†’ Order, qrCodeToken (unique), status (default VALID), scannedAt?
}
```

**Nota:** El `Ticket` no tiene relaciÃ³n directa con `Seat`. La informaciÃ³n del asiento (zona, nÃºmero, evento) se codifica dentro del QR JWT token y se decodifica en el endpoint `GET /orders` para enriquecer la respuesta.

---

## 6. Flujos de Negocio Verificados

### Flujo de Compra (End-to-End) âœ…

```
Usuario selecciona asientos â†’ POST /orders/lock-seats (Redis TTL 10min)
â†’ POST /orders/purchase â†’ Stripe mock â†’ Prisma transaction:
  [Seats marked sold + Order created + Tickets with QR JWT created]
â†’ Redis locks released â†’ Response with tickets & QR tokens
```

### Flujo de ValidaciÃ³n QR âœ…

```
Staff escanea QR â†’ POST /tickets/validate (token JWT)
â†’ JWT decoded â†’ Ticket found in DB â†’ Status check:
  - VALID â†’ Mark as USED, set scannedAt â†’ âœ… "Acceso Permitido"
  - USED â†’ âŒ "Este ticket YA FUE USADO anteriormente"
```

### Flujo de "Mis Tickets" âœ…

```
Usuario logueado â†’ GET /orders (JWT)
â†’ Backend: Fetch orders + tickets â†’ Decode cada QR JWT
â†’ Fetch event info (tÃ­tulo, fecha, ubicaciÃ³n) desde DB
â†’ Response enriquecida con eventTitle, zoneName, seatNumber por ticket
```

---

## 7. Datos de Prueba

| Rol       | Email                    | Password     | FunciÃ³n                  |
| :-------- | :----------------------- | :----------- | :----------------------- |
| **Host**  | `admin@openticket.com`   | `admin123`   | Crear eventos en `:4201` |
| **User**  | `cliente@openticket.com` | `cliente123` | Comprar en `:4200`       |
| **Staff** | `staff@openticket.com`   | `staff123`   | Validar QR en Mobile App |

**Script de seed:** `node scripts/seed-roles.js` (actualiza roles de USER â†’ HOST/STAFF)

---

## 8. GuÃ­a Operativa (CÃ³mo Iniciar)

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

# 5. Web Host (Terminal 3 â€” desde apps/web-host/)
npx next dev --port=4201

# 6. Mobile App (Terminal 4 â€” opcional)
cd apps/mobile-app && npx expo start
```

---

## 9. Roadmap (PrÃ³ximos Pasos)

### Fase 4: Mejoras de ProducciÃ³n

- [ ] IntegraciÃ³n real con Stripe (configurar `STRIPE_SECRET_KEY`)
- [ ] Panel de Admin (gestiÃ³n global)
- [ ] Reportes financieros para organizadores
- [ ] Emails transaccionales (confirmaciÃ³n de compra)
- [x] ~~Generar imagen QR real (librerÃ­a `qrcode`) en la pÃ¡gina "Mis Tickets"~~ âœ…
- [x] ~~BÃºsqueda y filtrado de eventos (por fecha, ubicaciÃ³n, categorÃ­a)~~ âœ…
- [ ] PaginaciÃ³n en endpoints (eventos, Ã³rdenes)
- [x] ~~Upload de imÃ¡genes de eventos~~ âœ…
- [ ] Sistema de categorÃ­as de eventos

### Fase 5: Escalabilidad

- [ ] Rate limiting en API
- [ ] Websockets para actualizaciones en tiempo real del mapa de asientos
- [ ] CDN para imÃ¡genes
- [ ] CI/CD pipeline
- [ ] Tests unitarios e integraciÃ³n

---

## 10. Problemas Conocidos / Notas

- **Puertos no estÃ¡ndar**: PostgreSQL en 5435, Redis en 6380 (para evitar conflictos).
- **Prisma 5.22.0**: VersiÃ³n bloqueada por incompatibilidades de CLI con v7+.
- **Pagos simulados**: El mÃ³dulo `PaymentsService` siempre retorna `true`. Necesita integraciÃ³n real con Stripe para producciÃ³n.
- **Web Host TUI**: `npx nx dev web-host` puede fallar en la TUI interactiva de Nx. Usar `npx next dev --port=4201` directamente desde `apps/web-host/`.
- **Webpack NestJS**: Usa `npx -y webpack-cli` en `project.json` para asegurar que el build encuentra el CLI.
- **Ticket sin relaciÃ³n a Seat**: El modelo `Ticket` no tiene `seatId`. La info del asiento se codifica en el QR JWT y se decodifica en runtime para el endpoint `GET /orders`.
- **Evento "Borrador"**: Los eventos se crean con status `DRAFT` excepto cuando se especifica `PUBLISHED` en el body.

---

## 11. Registro de Cambios Recientes (13-14 Feb 2026)

### Frontend (User Portal)

- **Feature "My Tickets" Finalizada:**
  - Implementada pÃ¡gina `/my-tickets` con listado de Ã³rdenes y detalle de tickets.
  - GeneraciÃ³n de QR en cliente usando librerÃ­a `qrcode`.
  - Estilos especÃ­ficos en `my-tickets.css` para evitar conflictos globales.
  - DiseÃ±o responsive y "tear-line" visual.
  - QR optimizado para legibilidad (dots negros, fondo blanco, centrado).
- **Mejoras Visuales (Polishing):**
  - **Auth Pages:** Nuevos estilos (`auth.css`) para Login y Register, corrigiendo layout y tarjetas.
  - **Event Detail:** Eliminado estilo de "tarjeta flotante" para integraciÃ³n seamless con la pÃ¡gina.
  - **Grid de Tickets:** Ajustado ancho de tarjetas (max 240px) y mÃ¡rgenes para mejor UX.
  - **Global CSS:** Limpieza de reglas conflictivas y duplicadas.

### Backend (API)

- **Orders Endpoint Updated:** `GET /orders` ahora decodifica el token QR para devolver `eventTitle`, `eventDate`, `eventLocation` y detalles de asiento (`zoneName`, `seatNumber`) directamente, facilitando el renderizado en frontend.

## 12. Registro de Cambios Recientes (15-16 Feb 2026)

### Sistema de Pagos

- **ReversiÃ³n de Stripe:** Se ha revertido la integraciÃ³n de Stripe para priorizar la estabilidad del desarrollo.
  - El sistema usa actualmente el **Mock Payment Service** (siempre aprueba).
  - Eliminada dependencia `@stripe/stripe-js` del flujo principal por ahora.

### Frontend (User Portal)

- **RediseÃ±o de Marca:**
  - Actualizado color primario a un verde mÃ¡s vibrante: `#6AC44D`.
  - Ajustados todos los componentes (botones, badges, links) para usar la nueva paleta.

- **PÃ¡gina de Detalle de Evento (`/events/[id]`):**
  - **Layout de 2 Columnas:** SeparaciÃ³n clara entre informaciÃ³n del evento (izquierda) y selecciÃ³n de tickets (derecha sticky).
  - **Experiencia Inmersiva:** Eliminado el contenedor tipo "tarjeta" para que el contenido fluya en la pÃ¡gina completa.
  - **Mejoras de UI:** TÃ­tulos mÃ¡s grandes, grid de informaciÃ³n con iconos, y alertas de estado mejoradas.

- **PÃ¡gina de Inicio (Landing):**
  - **Tarjetas de Evento:** Ahora tienen bordes redondeados (`border-radius-lg`), padding interno (`1.5rem`), y efectos de hover/zoom en la imagen.
  - **TipografÃ­a:** Mejor jerarquÃ­a visual en tÃ­tulos y metadatos.

- **PÃ¡gina "Mis Tickets" (`/my-tickets`):**
  - **AgrupaciÃ³n por Evento:** Las Ã³rdenes ahora se agrupan por `eventId`.
    - Si un usuario compra varias veces para el mismo evento, se muestra una sola tarjeta consolidada.
    - El total ($) y la cantidad de tickets se suman automÃ¡ticamente.
  - **VisualizaciÃ³n Unificada:** Al expandir, se muestran todos los tickets de todas las Ã³rdenes asociadas a ese evento en una sola grid.
# #   1 3 .   R e g i s t r o   d e   C a m b i o s   R e c i e n t e s   ( 1 6   F e b   2 0 2 6   -   S e s i Ã ³ n   d e   T a r d e / N o c h e ) 
 
 
 
 # # #   C a r a c t e r Ã ­ s t i c a s   A g r e g a d a s 
 
 
 
 -   * * D e s c r i p c i Ã ³ n   d e   Z o n a s   d e   E n t r a d a s : * * 
 
     -   * * S c h e m a : * *   A c t u a l i z a d o   m o d e l o   ` Z o n e `   e n   P r i s m a   p a r a   i n c l u i r   c a m p o   ` d e s c r i p t i o n `   o p c i o n a l . 
 
     -   * * B a c k e n d : * *   ` E v e n t s S e r v i c e `   a c t u a l i z a d o   p a r a   g u a r d a r   y   r e t o r n a r   l a   d e s c r i p c i Ã ³ n . 
 
     -   * * H o s t   ( C r e a t e   E v e n t ) : * *   F o r m u l a r i o   a c t u a l i z a d o   p a r a   p e r m i t i r   i n g r e s a r   d e s c r i p c i o n e s   p o r   z o n a   ( e j :   " I n c l u y e   b e b i d a " ,   " V i s t a   p a r c i a l " ) . 
 
     -   * * C l i e n t   ( E v e n t   D e t a i l ) : * *   M u e s t r a   l a   d e s c r i p c i Ã ³ n   d e b a j o   d e l   n o m b r e   d e   l a   z o n a   e n   e l   s e l e c t o r   d e   e n t r a d a s . 
 
 
 
 # # #   M e j o r a s   d e   E x p e r i e n c i a   d e   U s u a r i o   ( U X / U I ) 
 
 
 
 -   * * I d e n t i d a d   V i s u a l   p o r   Z o n a : * * 
 
     -   * * C Ã ³ d i g o   d e   C o l o r e s   E s t Ã ¡ t i c o : * *   I m p l e m e n t a d a   p a l e t a   d e   2 0   c o l o r e s   d e   a l t o   c o n t r a s t e   q u e   s e   a s i g n a n   d e t e r m i n Ã ­ s t i c a m e n t e   s e g Ã º n   e l   n o m b r e   d e   l a   z o n a . 
 
     -   * * E v e n t   D e t a i l : * *   C Ã ­ r c u l o s   d e   c o l o r   i n d i c a d o r e s   j u n t o   a l   n o m b r e   d e   l a   z o n a   y   a s i e n t o s   s e l e c c i o n a d o s   s e   p i n t a n   d e l   c o l o r   d e   s u   z o n a . 
 
     -   * * M y   T i c k e t s : * *   L a s   t a r j e t a s   d e   t i c k e t s   t i e n e n   u n   b o r d e   s u p e r i o r   d e   c o l o r   y   u n   b a d g e   c o n   e l   c o l o r   d e   s u   z o n a   p a r a   r Ã ¡ p i d a   i d e n t i f i c a c i Ã ³ n . 
 
 
 
 -   * * M a n e j o   d e   " A g o t a d o "   ( S o l d   O u t ) : * * 
 
     -   * * L Ã ³ g i c a   V i s u a l : * *   L a s   z o n a s   s i n   a s i e n t o s   d i s p o n i b l e s   s e   m u e s t r a n   c o n   o p a c i d a d   r e d u c i d a . 
 
     -   * * I n d i c a d o r e s : * *   B a d g e   r o j o   " A G O T A D O "   j u n t o   a l   n o m b r e   y   m e n s a j e   " Â ¡ N o   q u e d a n   e n t r a d a s ! "   e n   l u g a r   d e   l o s   c o n t r o l e s   d e   s e l e c c i Ã ³ n . 
 
     -   * * B l o q u e o : * *   D e s h a b i l i t a c i Ã ³ n   d e   b o t o n e s   d e   c o m p r a   p a r a   z o n a s   a g o t a d a s . 
 
 
 
 -   * * S e l e c t o r   d e   C a n t i d a d   I n t e l i g e n t e : * * 
 
     -   P a r a   z o n a s   c o n   c a p a c i d a d   >   5 0   ( G e n e r a l ) ,   s e   m u e s t r a   a u t o m Ã ¡ t i c a m e n t e   u n   s e l e c t o r   n u m Ã © r i c o   ( + / - )   e n   l u g a r   d e   i n t e n t a r   r e n d e r i z a r   t o d o s   l o s   a s i e n t o s   i n d i v i d u a l e s . 
 
     -   P a r a   z o n a s   c o n   c a p a c i d a d   < =   5 0   ( N u m e r a d a s ) ,   s e   m a n t i e n e   e l   m a p a   d e   s e l e c c i Ã ³ n   d e   a s i e n t o s   i n d i v i d u a l . 
 
 
 
 -   * * M i c r o - c o p y : * * 
 
     -   A c t u a l i z a d o   t e x t o   C T A   a   " S e l e c c i o n a   t u s   e n t r a d a s / a s i e n t o s   a r r i b a "   p a r a   m a y o r   c l a r i d a d . 
 
 
 
 # #   1 4 .   R e g i s t r o   d e   C a m b i o s   R e c i e n t e s   ( 2 4   F e b   2 0 2 6 ) 
 
 # # #   M e j o r a   e n   V i s u a l i z a c i ó n   d e   C i u d a d   e n   Ó r d e n e s 
 -   * * B a c k e n d * * :   E n d p o i n t   G E T   / a p i / o r d e r s   a h o r a   i n c l u y e   e l   c a m p o   c i t y   d e l   E v e n t o   a s o c i a d o   u s a n d o   e l   P r i s m a C l i e n t . 
 -   * * F r o n t e n d * * :   E n r i c h e d T i c k e t   m o d i f i c a d o   p a r a   a l m a c e n a r   e v e n t C i t y .   E l   c o m p o n e n t e   d e   l a   l i s t a   d e   ó r d e n e s   ( m y - t i c k e t s / p a g e . t s x )   f u e   a c t u a l i z a d o   p a r a   m o s t r a r   s i e m p r e   e n   l a   v i s t a   d e t a l l a d a   l a   c i u d a d   ( e j .     L u g a r ,   C i u d a d ) . 
 
## 15. Registro de Cambios (26 Marzo 2026)

### GestiÃ³n de Estado de Eventos
- **Tabs en Dashboard**: Implementadas pestaÃ±as "Activos", "Inactivos" y "Borrador" en el dashboard del Host para filtrar eventos por estado.
- **Fix de Estado en CreaciÃ³n**: Corregido bug donde los nuevos eventos se creaban como 'DRAFT' (Borrador) aun cuando se seleccionaba 'PUBLISHED' (Activo). Se integrÃ³ `status` en el DTO de validaciÃ³n.
- **DesactivaciÃ³n AutomÃ¡tica**: Los eventos con fecha pasada se marcan automÃ¡ticamente como 'INACTIVE' al consultar la lista de eventos.

## 16. Registro de Cambios (31 Marzo 2026)

### EdiciÃ³n Completa de Zonas de Eventos (Fix Mayor)

**Problema resuelto**: Las descripciones y capacidades de las zonas no se guardaban al editar eventos desde el dashboard del Host.

**Causa raÃ­z**: Tres problemas interconectados:
1. **NX Daemon no funciona**: Los cambios al backend no se recompilaban automÃ¡ticamente. Cada modificaciÃ³n requiere `npx nx build api` + `node dist/apps/api/main.js`.
2. **Datos no sanitizados para Prisma**: El `basicData` pasado a `prisma.event.update()` podÃ­a contener campos con tipos incorrectos (ej: `date` como string), causando que la transacciÃ³n Prisma se revirtiera silenciosamente.
3. **Falta de gestiÃ³n de asientos al cambiar capacidad**: No se creaban ni eliminaban asientos al cambiar la capacidad de una zona.

**Archivos modificados**:
- `apps/api/src/app/events/events.service.ts`  MÃ©todo `update` reescrito con:
  - Filtrado de campos permitidos para el modelo Event
  - ConversiÃ³n de `date` string  `Date` object
  - ProtecciÃ³n de capacidad (no permite reducir bajo el # de vendidos)
  - CreaciÃ³n/eliminaciÃ³n automÃ¡tica de asientos al cambiar capacidad
  - `findAll` ahora incluye `seats` en las zonas
- `apps/api/src/app/events/events.controller.ts`  PATCH usa `@Request()` para evitar whitelist del ValidationPipe
- `apps/web-host/src/components/EditEventForm.tsx`  ProtecciÃ³n visual de campos, validaciÃ³n de capacidad, soldCount
- `libs/shared/src/lib/dto/events.dto.ts`  `id` opcional en CreateZoneDto, `zones` opcional, nuevo `UpdateEventDto`

**Reglas de negocio implementadas**:
| Campo | Â¿Editable con ventas activas? | RestricciÃ³n |
| :--- | :--- | :--- |
| Nombre de zona |  No | Bloqueado si hay tickets vendidos |
| DescripciÃ³n |  SÃ­ | Siempre editable |
| Precio |  No | Bloqueado si hay tickets vendidos |
| Capacidad |  SÃ­ | MÃ­nimo = nÃºmero de tickets vendidos |
| Agregar zona |  SÃ­ | Siempre permitido |
| Eliminar zona |  (con ventas) | Solo si 0 tickets vendidos en esa zona |

**ValidaciÃ³n de fecha pasada**: REMOVIDA del mÃ©todo `update` (se mantiene solo en `create`). Permite editar metadatos de eventos activos/pasados.
