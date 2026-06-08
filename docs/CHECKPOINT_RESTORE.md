# PUNTO DE RESTAURACIÓN: AfroEventos (Sistema Completo)

**Fecha de Última Actualización:** 8 de Junio de 2026 (Sesión 20)
**Estado del Proyecto:** COMPLETO Y EN PRODUCCIÓN — Fases 1-4 + Portal Cliente completo + Panel Host completo + Panel Admin completo + Sistema de Emails Transaccionales completo + Auth flow (verify/forgot/reset password) + URLs `/eventos/` en español + Favicons AfroEventos + Sistema de Banners Publicitarios full-stack + UI/UX Portal Cliente (Destacados Adaptativos + FeaturedCarousel + EventsGrid paginación real) + OrganizerCTA + Navbar dropdown + Galería rediseñada + sellOnSite en zonas (full-stack) + Bloqueo de Organizadores (full-stack, sesión inmediata) + Modales personalizados (sin confirm/alert nativo) + Persistencia de vista en URL + Impersonación de Organizadores por Admin + Control de Pasarela de Pagos (global + por org) + Límite anual por aniversario en planes + Paginación real en API + Sistema de imágenes optimizado (Sharp WebP, límites y formatos configurables desde .env) + **UI Polish**: precios ocultos en EventCard, hover shadows navbar eliminados, logos sidebars y footer clicables + **TODOS LOS SERVICIOS EN PRODUCCIÓN**: API + 3 frontends (Coolify) + DB schema aplicado + admin "Blade" creado + **EMAILS EN PRODUCCIÓN**: Resend SMTP (puerto 587) + 12 plantillas con logo oficial AfroEventos + best practices Gmail/Outlook + **Sesión 14**: Sistema de Categorías de Eventos full-stack (EventCategory model + CategoriesModule + Admin UI + formularios host dinámicos + pills con filtro inteligente) + Buscador corregido (SearchBar con useTransition + loading.tsx + fetches paralelos) + múltiples fixes de filtrado y UX + **Sesión 15**: Modo Prueba de Organizadores + Kill-switch de pagos en tiempo real + UX errores de compra + **Sesión 16**: `.env` sacado de git + `findAll` con `_count` aggregate + limpieza de imágenes huérfanas generalizada + 8 `as any` eliminados con enums Prisma + **Sesión 17**: UX Responsive completo (imagen 1:1 en móvil, hero carrusel oculto móvil + mejoras tablet, márgenes sección destacados, `object-fit:contain` en card-h, logo admin login clicable, botón "Ya tengo cuenta" en OrganizerCTA) + **Sesión 18**: Validación de formularios completa (teléfono en backend + 6 frontends, `minLength` passwords) + UX web-host registro (etiquetas botones simplificadas, campo teléfono con prefijo 🇪🇨 +593) + **Sesión 19**: deuda técnica `Ticket.eventId` (denormalización eventId/zoneName/seatNumber + paginación real de asistentes y notificaciones sin decodificar todos los JWT + backfill) + Sistema de imágenes con redimensionado server-side por tipo (`kind`) + banner a proporción natural sin recorte + tamaños recomendados (banner 1500×500 3:1, cuadrada 1080×1080, retrato 1200×1600) + aviso de resolución mínima + `uploads/` fuera de git + de-duplicación de CSS de tickets en `global.css` + **Sesión 20**: Rate limiting en API (`@nestjs/throttler` v6 ya instalado — se añadieron `@Throttle()` en endpoints sensibles: login 10/15min, register 10/h, register-host 5/h, forgot-password 5/15min, resend-verification 5/15min, reset-password 10/15min, purchase 15/min, upload 20/min) + mensajes 429 en español en los 3 fetchAPI y funciones de upload de los 3 frontends

---

## 1. Cómo Retomar el Proyecto

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

### Paso 3: Iniciar Servidores

Abre **4 terminales** en VS Code (`Ctrl+Shift+ñ`) y ejecuta:

**Terminal 1: Backend (API) — con hot-reload automático**

```bash
npx nx serve api --no-dte
```

> Daemon activo: recompila y reinicia automáticamente al guardar cambios.
> _(Espera a que diga "Application is running on: http://localhost:3000/api")_

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

> **NOTA**: No uses `npx nx dev ...` ya que la TUI interactiva de Nx puede dar problemas. Usa `npx next dev --port=XXXX` directamente.

### Paso 4 (Alternativa): Script de inicio rápido

```bash
start-all.bat
```

Inicia los 4 servicios en ventanas separadas automáticamente.

### Paso 5: App Móvil (Staff — Opcional)

```bash
cd apps/mobile-app
npx expo start
```

_(Usa la App "Expo Go" en tu celular para escanear el QR de la terminal)_

---

## 2. Credenciales de Prueba

### Local (desarrollo)

| Rol                    | Email                      | Password       | Dónde usarlo                           |
| :--------------------- | :------------------------- | :------------- | :------------------------------------- |
| Administrador Global   | `admin@admin.com`          | `admin123`     | `http://localhost:4202` (web-admin)    |
| Organizador (Host)     | `admin@openticket.com`     | _(restablecer si es necesario)_ | `http://localhost:4201` (Panel Host) |
| Organizador (Host)     | `grouphackingx@gmail.com`  | _(restablecer si es necesario)_ | `http://localhost:4201` (Panel Host) |
| Cliente (User)         | `dmxwilly@gmail.com`       | `willy2024`    | `http://localhost:4200` (Portal Cliente) |
| Cliente (User)         | `cliente@openticket.com`   | `cliente123`   | `http://localhost:4200` (Portal Cliente) |
| Staff (Validator)      | `staff@openticket.com`     | `staff123`     | Mobile App (Expo Go)                   |

### Producción (Coolify)

| Rol | Email | Dónde usarlo |
| :-- | :---- | :----------- |
| Administrador Global ("Blade") | `dmxwilly@gmail.com` | `https://admin.afroeventos.com` — contraseña guardada de forma segura fuera del repo |

> **NOTA**: Los tokens JWT duran **24 horas**. Si la API devuelve 401, cerrar sesión y volver a entrar.

---

## 3. Funcionalidades Verificadas

### Backend (API — Puerto 3000)

| Método | Endpoint                            | Auth        | Estado | Descripción                             |
| :----- | :---------------------------------- | :---------- | :----- | :-------------------------------------- |
| POST   | `/api/auth/login`                   | No          | OK     | Login JWT (retorna access_token + user) |
| POST   | `/api/auth/register`                | No          | OK     | Registro + envía email de verificación  |
| GET    | `/api/auth/verify-email?token=`     | No          | OK     | Verifica email con token JWT            |
| POST   | `/api/auth/resend-verification`     | No          | OK     | Reenvía email verificación (anti-enum)  |
| POST   | `/api/auth/forgot-password`         | No          | OK     | Solicita reset de contraseña (anti-enum)|
| POST   | `/api/auth/reset-password`          | No          | OK     | Restablece contraseña con token         |
| GET    | `/api/auth/me`                      | JWT (USER)  | OK     | Perfil completo del usuario autenticado |
| PATCH  | `/api/auth/me`                      | JWT (USER)  | OK     | Actualizar perfil (nombre, email, password, ID, dirección, foto) |
| GET    | `/api/auth/me/organizer`            | JWT         | OK     | Perfil completo: HOST o OrganizerMember |
| PATCH  | `/api/auth/me/basic`                | JWT         | OK     | Actualizar nombre, email, teléfono, avatar |
| PATCH  | `/api/auth/me/password`             | JWT         | OK     | Cambiar contraseña con verificación bcrypt |
| PATCH  | `/api/auth/me/organizer-profile`    | JWT (HOST)  | OK     | Datos de organización (403 si es miembro) |
| GET    | `/api/events?page=&limit=&q=`       | No          | OK     | Listar eventos PUBLISHED paginados — `{ data, total, page, limit, totalPages }` |
| GET    | `/api/events/:id`                   | No          | OK     | Detalle por slug o UUID                 |
| POST   | `/api/events`                       | JWT (HOST)  | OK     | Crear evento con zonas + genera slug    |
| PATCH  | `/api/events/:id`                   | JWT (HOST)  | OK     | Editar evento, zonas, descripciones + notifica compradores si se cancela o reprograma |
| DELETE | `/api/events/:id`                   | JWT (HOST)  | OK     | Borrar evento (solo si 0 vendidos)      |
| POST   | `/api/orders/lock-seats`            | JWT         | OK     | Bloquear asientos (Redis 10 min)        |
| POST   | `/api/orders/unlock-seats`          | JWT         | OK     | Liberar asientos bloqueados             |
| POST   | `/api/orders/purchase`              | JWT         | OK     | Comprar tickets (genera QR JWT + envía confirmación por email) |
| GET    | `/api/orders`                       | JWT         | OK     | Mis órdenes enriquecidas con detalle    |
| GET    | `/api/orders/attendees/me`          | JWT (HOST)  | OK     | Lista de asistentes del organizador     |
| POST   | `/api/tickets/validate`             | JWT         | OK     | Validar ticket QR (VALID → USED)        |
| POST   | `/api/tickets/validate-by-id`       | JWT         | OK     | Validar por ID corto (#c288f2ae)        |
| POST   | `/api/upload`                       | Opcional    | OK     | Subir imágenes → Sharp convierte a WebP + comprime. Límite: `NEXT_PUBLIC_MAX_UPLOAD_MB`. Formatos: `NEXT_PUBLIC_ALLOWED_IMAGE_TYPES`. Storage: `STORAGE_PROVIDER` (local o cloudinary) |
| GET    | `/api/banners`                      | No          | OK     | Banners activos ordenados (público — para web-client) |
| GET    | `/api/banners/admin`                | JWT (ADMIN/EDITOR) | OK | Todos los banners incluyendo inactivos          |
| POST   | `/api/banners`                      | JWT (ADMIN/EDITOR) | OK | Crear banner publicitario                       |
| PATCH  | `/api/banners/:id`                  | JWT (ADMIN/EDITOR) | OK | Editar banner (imagen, título, link, estado, orden) |
| DELETE | `/api/banners/:id`                  | JWT (ADMIN/EDITOR) | OK | Eliminar banner                                 |
| GET    | `/api/plans`                        | No          | OK     | Planes públicos para formulario registro|
| GET    | `/api/admin/plans`                  | JWT (ADMIN) | OK     | CRUD Planes — Listar                    |
| POST   | `/api/admin/plans`                  | JWT (ADMIN) | OK     | CRUD Planes — Crear                     |
| PATCH  | `/api/admin/plans/:id`              | JWT (ADMIN) | OK     | CRUD Planes — Editar                    |
| DELETE | `/api/admin/plans/:id`              | JWT (ADMIN) | OK     | CRUD Planes — Eliminar                  |
| GET    | `/api/admin/users`                  | JWT (ADMIN) | OK     | Gestión usuarios Admin/Editor — Listar  |
| POST   | `/api/admin/users`                  | JWT (ADMIN) | OK     | Crear Admin/Editor (envía credenciales por email) |
| PATCH  | `/api/admin/users/:id`              | JWT (ADMIN) | OK     | Editar Admin/Editor                     |
| DELETE | `/api/admin/users/:id`              | JWT (ADMIN) | OK     | Eliminar Admin/Editor                   |
| GET    | `/api/admin/organizers?page=&limit=`| JWT (ADMIN/EDITOR) | OK | Listar organizadores paginados — `{ data, total, page, limit, totalPages }` |
| PATCH  | `/api/admin/organizers/:id/status`  | JWT (ADMIN/EDITOR) | OK | Aprobar / Rechazar / Bloquear organizador |
| POST   | `/api/admin/organizers/:id/impersonate` | JWT (ADMIN) | OK | Generar JWT de 1h para acceder como el organizador |
| GET    | `/api/admin/events?page=&limit=`    | JWT (ADMIN) | OK     | Directorio global de eventos paginado — `{ data, total, page, limit, totalPages }` |
| PATCH  | `/api/admin/events/:id/featured`    | JWT (ADMIN) | OK     | Activar/desactivar evento destacado     |
| GET    | `/api/admin/config`                 | JWT (ADMIN) | OK     | Obtener configuración global del sistema (paidEventsEnabled) |
| PATCH  | `/api/admin/config`                 | JWT (ADMIN) | OK     | Actualizar toggle global de pasarela de pagos |
| PATCH  | `/api/admin/organizers/:id/payment-gateway` | JWT (ADMIN) | OK | Override de pasarela por organizador (null/true/false) |
| GET    | `/api/events/payment-status`        | JWT (HOST)  | OK     | Consultar si el organizador autenticado puede crear eventos de pago |

### Web Client (Puerto 4200)

| Ruta                        | Estado | Descripción                                                |
| :-------------------------- | :----- | :--------------------------------------------------------- |
| `/`                         | OK     | Hero split + Carrusel coverflow 3:4 + **Sección Destacados adaptativa** (1→horizontal / 2→side-by-side / 3+→FeaturedCarousel) + Catálogo con "Mostrar más" + **Banner Slider** + **OrganizerCTA** (al final, solo sin búsqueda) |
| `/login`                    | OK     | Login + link "¿Olvidaste tu contraseña?" |
| `/register`                 | OK     | Registro + pantalla "Revisa tu correo" post-registro |
| `/verify-email?token=`      | OK     | Verificación de email con estados: verificando / éxito / expirado |
| `/forgot-password`          | OK     | Solicitar reset de contraseña |
| `/reset-password?token=`    | OK     | Nueva contraseña + confirmación + auto-redirect 3s |
| `/eventos/[id]`             | OK     | Detalle del evento + mapa de asientos interactivo + compra |
| `/my-tickets`               | OK     | Lista de tickets comprados con QR y estado (USED gris) |
| `/my-profile`               | OK     | Perfil: avatar, datos acceso, identificación, dirección Ecuador |
| `/politicas-de-privacidad`  | OK     | 9 secciones de política de privacidad |
| `/terminos-y-condiciones`   | OK     | 12 secciones de términos y condiciones |

> **NOTA**: La ruta anterior `/events/[id]` ya no existe. Fue reemplazada por `/eventos/[id]`.
> Los enlaces en tarjetas, carrusel, mis tickets y email templates todos apuntan a `/eventos/`.

### Web Host (Puerto 4201)

| Sección              | Estado | Descripción                                                         |
| :------------------- | :----- | :------------------------------------------------------------------ |
| Login                | OK     | Login + link "¿Olvidaste tu contraseña?" → `/forgot-password`       |
| Forgot Password      | OK     | Solicitar reset de contraseña por email (válido 60 min)             |
| Reset Password       | OK     | Nueva contraseña + confirmación + auto-redirect 3s al login         |
| Dashboard / Inicio   | OK     | Stats + tabla de eventos con pestañas (Activos/Inactivos/Borrador)  |
| Crear Evento         | OK     | Formulario completo con zonas, galería, imagen retrato 3:4; tipo por defecto "Entradas", precio/capacidad por defecto 0; checkbox sellOnSite por zona; banner naranja + precio/capacidad bloqueados si pasarela desactivada |
| Editar Evento        | OK     | Edición de zonas con protección de ventas activas; checkbox sellOnSite (deshabilitado si hay ventas); precio/capacidad bloqueados si pasarela desactivada |
| Eliminar Evento      | OK     | Solo visible si 0 tickets vendidos                                  |
| Asistentes           | OK     | Compradores por evento + tickets comprados/usados + filtro + búsqueda |
| Escáner de Tickets   | OK     | 3 tabs: Cámara QR, Buscar por ID corto, Token JWT manual            |
| Usuarios             | OK     | OrganizerMembers (ADMIN/STAFF): crear, editar, eliminar, avatar     |
| Perfil               | OK     | Info personal, datos de organización (solo HOST), cambio contraseña |
| **Vista persistente en URL** | OK | `?view=X` en URL — al recargar se restaura la sección activa  |
| **Modales personalizados** | OK | Sin confirm/alert nativo — `useConfirm()` + `useToast()` vía `UIHelpers.tsx` |
| **Modo Vista Admin** | OK     | Banner morado fijo cuando el admin accede como organizador (`/auth/impersonate`) |

### Web Admin (Puerto 4202)

| Sección               | Estado | Descripción                                                        |
| :-------------------- | :----- | :----------------------------------------------------------------- |
| Login                 | OK     | Login + link "¿Olvidaste tu contraseña?" → `/forgot-password`      |
| Forgot Password       | OK     | Solicitar reset de contraseña por email                            |
| Reset Password        | OK     | Nueva contraseña + confirmación + auto-redirect 3s al login        |
| Panel Inicio          | OK     | Resumen del sistema con stats de organizaciones (incluye stat Bloqueados) |
| Gestión Organizadores | OK     | Tabla + avatar/logo; acciones: Aprobar, **Bloquear 🔒/Desbloquear 🔓**, **Acceder como 👁**, Editar, Eliminar |
| Modal Edición Org     | OK     | Email, org, representante, ubicación, plan, estado (incl. BLOCKED), contraseña, logo |
| Analíticas            | OK     | Métricas de eventos, tickets y revenue por organizador             |
| Gestión de Eventos    | OK     | Directorio global con tabs (Activos/Inactivos/Borrador)            |
| Destacar Evento       | OK     | Botón Destacar con duración en días + expiración automática (cron) |
| Editar Evento         | OK     | Formulario completo con todas las validaciones de ventas           |
| Eliminar Evento       | OK     | Solo visible si el evento no tiene tickets vendidos                |
| **Banners Publicitarios** | OK | CRUD de banners (1-3) con upload, preview 16:3, activar/desactivar, toast feedback |
| **Categorías de Eventos** | OK | CRUD completo: crear/editar/activar/desactivar/eliminar + botón seed de 13 categorías predeterminadas. Sidebar ítem "🏷️ Categorías". Muestra conteo de eventos por categoría |
| **Pasarela de Pagos** | OK     | Card global (solo ADMIN) con badge HABILITADA/DESHABILITADA + botón toggle con confirmación; columna "Pagos" en tabla de orgs (botón cíclico: Global/Habilitado/Deshabilitado) |
| Gestión de Planes     | OK     | CRUD completo (nombre, precio, límite de eventos — conteo anual por aniversario de contratación) |
| Gestión de Usuarios   | OK     | CRUD Admin/Editor; envía credenciales por email al crear           |
| **Vista persistente en URL** | OK | `?view=X` en URL — al recargar se restaura la sección activa  |
| **Modales personalizados** | OK | Sin confirm/alert nativo — `ConfirmModal` + `ToastStack` inline   |

---

## 4. Sistema de Emails Transaccionales

### Configuración (`.env`)

```env
MAIL_HOST=smtp.gmail.com        # o smtp.resend.com para Resend
MAIL_PORT=587                   # 465 para SSL
MAIL_SECURE=false               # true para SSL
MAIL_USER=tucuenta@gmail.com
MAIL_PASS=xxxx xxxx xxxx xxxx  # contraseña de aplicación Gmail
MAIL_FROM=AfroEventos <no-reply@afroeventos.com>
```

> Si `MAIL_HOST` está vacío, los emails se "envían" sin error (se loguean silenciosamente).
> Patrón fire-and-forget en todos los lados: `.catch(() => null)` — nunca bloquea el flujo del usuario.

### Templates Implementados (13 total)

| Template | Trigger | Descripción |
| :--- | :--- | :--- |
| `welcome-user` | Registro de cliente | Bienvenida + CTA explorar eventos |
| `welcome-host` | Registro de organizador | Bienvenida + próximos pasos |
| `verify-email` | Registro de cliente | Token de verificación de email (expira en 24h) |
| `reset-password` | Forgot password | Token para restablecer contraseña (expira en 1h) |
| `password-changed` | Cambio de contraseña | Confirmación + alerta "¿No fuiste tú?" con link reset |
| `purchase-confirmation` | Compra de tickets | Resumen de compra con todos los tickets y QR info |
| `host-approved` | Admin aprueba organizador | Bienvenida al panel de organizadores |
| `host-rejected` | Admin rechaza organizador | Motivo del rechazo + opciones |
| `account-created-by-admin` | Admin crea HOST/ADMIN/EDITOR | Credenciales (email + contraseña temporal) + URL del panel correcto |
| `member-invitation` | Host crea miembro ADMIN/STAFF | Credenciales + descripción del rol + URL del panel |
| `event-canceled` | Evento cancelado (status → CANCELLED) | Aviso urgente con detalle del evento + info de reembolso |
| `event-rescheduled` | Evento reprogramado (fecha/lugar cambiados) | Comparación fecha/lugar anterior vs. nueva |
| `base.layout` | Base compartida | Layout HTML responsive con logo, gradiente y footer |

### Cuándo se dispara cada email

| Acción del sistema | Email enviado |
| :--- | :--- |
| `POST /api/auth/register` | `welcome-user` + `verify-email` |
| `GET /api/auth/verify-email?token=` (éxito) | _(ninguno)_ |
| `POST /api/auth/forgot-password` | `reset-password` (si el email existe; siempre responde igual) |
| `POST /api/auth/reset-password` (éxito) | _(ninguno actualmente)_ |
| `PATCH /api/auth/me/password` (éxito) | `password-changed` |
| `PATCH /api/auth/me/basic` con password | `password-changed` |
| `POST /api/orders/purchase` (éxito) | `purchase-confirmation` |
| Admin aprueba organizador | `host-approved` |
| Admin rechaza organizador | `host-rejected` |
| `POST /api/admin/users` (crear HOST) | `account-created-by-admin` (role: HOST, link al panel Host) |
| `POST /api/admin/users` (crear ADMIN/EDITOR) | `account-created-by-admin` (role: ADMIN, link al panel Admin) |
| `POST /organizer-members` (crear miembro) | `member-invitation` |
| `PATCH /api/events/:id` con `status: CANCELLED` | `event-canceled` a todos los compradores |
| `PATCH /api/events/:id` con cambio de fecha/lugar | `event-rescheduled` a todos los compradores |

### Cómo encuentra compradores para notificaciones de evento

Los compradores se identifican decodificando todos los `qrCodeToken` (JWT) de la tabla `Ticket`. Cada token contiene `{ eventId, ... }`. Proceso en `EventsService.notifyBuyersOfChange()`:

1. Carga todos los tickets con su `order.user`
2. Decodifica cada JWT con `JwtService.verify()`
3. Filtra los que tienen `decoded.eventId === eventId`
4. Deduplicación por userId para no enviar duplicados
5. Envía email a cada comprador único

---

## 5. Auth Flow Completo (Verificación y Reset)

### Schema Prisma (campos agregados a `User`)

```prisma
emailVerified        Boolean   @default(true)  // true = grandfathered existing users
resetPasswordToken   String?   @unique
resetPasswordExpires DateTime?
```

> `emailVerified @default(true)` mantiene compatibilidad con usuarios anteriores.
> Los hosts tienen `emailVerified: true` por defecto (son aprobados manualmente por el admin).

### Flujo Verificación de Email

```
POST /api/auth/register
  → Crea usuario con emailVerified: false
  → Genera token JWT (expiresIn: '24h')
  → Guarda token en User.resetPasswordToken (reutilizado)
  → Envía email verify-email con link:
    http://localhost:4200/verify-email?token=JWT

GET /api/auth/verify-email?token=JWT
  → Verifica JWT + busca usuario por token
  → Actualiza emailVerified: true
  → Limpia token del campo
  → Retorna { message: 'Email verificado correctamente' }

POST /api/auth/resend-verification { email }
  → Anti-enumeración: siempre responde igual
  → Busca usuario, genera nuevo token, reenvía email
```

### Flujo Reset de Contraseña

```
POST /api/auth/forgot-password { email }
  → Anti-enumeración: siempre responde igual
  → Si el email existe: genera token JWT (expiresIn: '1h')
  → Guarda token + expires en resetPasswordToken/Expires
  → Envía email reset-password con link:
    http://localhost:4200/reset-password?token=JWT (web-client)
    http://localhost:4201/reset-password?token=JWT (web-host)
    http://localhost:4202/reset-password?token=JWT (web-admin)

POST /api/auth/reset-password { token, newPassword }
  → Verifica JWT + compara con campo resetPasswordToken
  → Verifica que no haya expirado (resetPasswordExpires)
  → Hashea nueva contraseña con bcrypt
  → Actualiza contraseña + limpia token/expires
  → Retorna { message: 'Contraseña actualizada correctamente' }
```

### Páginas de Auth en Web Client (`/apps/web-client/src/app/`)

| Ruta | Archivo | Descripción |
| :--- | :--- | :--- |
| `/verify-email` | `verify-email/page.tsx` | Estados: verificando spinner / éxito / token expirado con opción reenvío |
| `/forgot-password` | `forgot-password/page.tsx` | Form email + pantalla éxito "Revisa tu correo" |
| `/reset-password` | `reset-password/page.tsx` | Nueva contraseña + confirmar + toggle visibilidad + auto-redirect 3s |
| `/register` | `register/page.tsx` | Modificado: paso 2 muestra "Revisa tu correo, verifica tu email" |
| `/login` | `login/page.tsx` | Modificado: link "¿Olvidaste tu contraseña?" junto al label Password |

### Páginas de Auth en Web Host (`/apps/web-host/src/app/`)

| Ruta | Archivo | Descripción |
| :--- | :--- | :--- |
| `/forgot-password` | `forgot-password/page.tsx` | Placeholder `admin@afroeventos.com` + "válido 60 min" |
| `/reset-password` | `reset-password/page.tsx` | Nueva contraseña + confirmar + auto-redirect 3s |
| `/login` | `login/page.tsx` | Modificado: link "¿Olvidaste tu contraseña?" |

### Páginas de Auth en Web Admin (`/apps/web-admin/app/`)

| Ruta | Archivo | Descripción |
| :--- | :--- | :--- |
| `/forgot-password` | `forgot-password/page.tsx` | Menciona "cuenta de administrador" |
| `/reset-password` | `reset-password/page.tsx` | Nueva contraseña + confirmar + auto-redirect 3s |
| `/login` | `login/page.tsx` | Modificado: link "¿Olvidaste tu contraseña?" |

---

## 6. Cambio de URL `/events/` → `/eventos/`

### Qué cambió

- La ruta del Portal de Clientes para ver eventos es ahora `/eventos/[id]` (en español)
- La carpeta `apps/web-client/src/app/events/[id]/` fue eliminada
- La carpeta `apps/web-client/src/app/eventos/[id]/` es la ruta activa

### Archivos migrados

| Archivo | Cambio |
| :--- | :--- |
| `src/app/eventos/[id]/page.tsx` | Nuevo. OG `pageUrl` apunta a `/eventos/`. Reemplaza a `events/[id]/page.tsx` |
| `src/app/eventos/[id]/EventDetailClient.tsx` | Nuevo. Login redirect y links del toast usan `/eventos/` |
| `src/components/EventCard.tsx` | `href` → `/eventos/${event.slug \|\| event.id}` |
| `src/components/FeaturedEventsSection.tsx` | `href` → `/eventos/${event.slug \|\| event.id}` |
| `src/components/HeroCarousel.tsx` | `href` → `/eventos/${event.slug \|\| event.id}` |
| `src/app/my-tickets/page.tsx` | `href` → `/eventos/${group.eventId}` |

### Qué NO cambió (correcto así)

- `apps/web-client/src/lib/api.ts:130` — llama a `/api/events/${id}` (ruta del backend NestJS, no del frontend)
- `apps/web-host/src/lib/api.ts` y `apps/web-admin/lib/api.ts` — todas sus referencias `/events/` son llamadas HTTP al backend

---

## 7. Sistema de Banners Publicitarios

### Flujo completo

```
Admin sube imagen → POST /api/upload?type=banner → guarda en ./uploads/banners/{uuid}.jpg
                  → copia la URL → POST /api/banners { imageUrl, title?, linkUrl?, isActive, order }
                  → Banner guardado en BD

Web Client (SSR) → getBanners() → GET /api/banners → [banners activos ordenados]
                 → <BannerSlider banners={banners} /> renderizado entre Destacados y Próximos Eventos
                 → Auto-avance 5s, flechas prev/next, puntos indicadores
                 → Clic en banner → redirige a linkUrl (target _blank) si existe
```

### Límites y comportamiento

| Regla | Detalle |
| :---- | :------ |
| Máximo de banners | 3 (limitado en UI Admin — el botón "Agregar" se deshabilita) |
| Banners inactivos | No aparecen en `GET /api/banners` (público). Solo en `GET /api/banners/admin` |
| Banner sin imagen | La UI Admin bloquea el guardado si no hay imagen |
| API caída | `getBanners().catch(() => [])` — el slider no se renderiza, no hay error de página |
| Un solo banner | No se muestran flechas ni puntos; la imagen es estática |

### Archivos clave

| Archivo | Descripción |
| :------ | :---------- |
| `libs/shared/prisma/schema.prisma` | Modelo `Banner` |
| `apps/api/src/app/banners/banners.service.ts` | Lógica CRUD |
| `apps/api/src/app/banners/banners.controller.ts` | Endpoints REST |
| `apps/api/src/app/upload/upload.controller.ts` | Tipo `banner` para upload |
| `apps/web-admin/lib/api.ts` | `getBannersAdmin`, `createBanner`, `updateBanner`, `deleteBanner`, `uploadBannerImage` |
| `apps/web-admin/app/dashboard/page.tsx` | `BannersView` — componente CRUD completo |
| `apps/web-client/src/lib/api.ts` | `getBanners()`, tipo `BannerItem` |
| `apps/web-client/src/components/BannerSlider.tsx` | Slider cliente 16:3 |
| `apps/web-client/src/app/page.tsx` | Integración server-side de `getBanners()` |
| `apps/web-client/src/app/global.css` | Estilos del slider (al final del archivo) |

---

## 8. Notas Técnicas Importantes

- **NX Daemon**: Activo (`useDaemonProcess: true`). `npx nx serve api --no-dte` para desarrollo — hot-reload automático.
- **Puertos**: PostgreSQL en **5435**, Redis en **6380** (no estándar para evitar conflictos).
- **Prisma**: Versión **5.22.0** bloqueada. Al cambiar schema: `npx prisma db push` con la API detenida.
- **JWT**: Tokens duran **24 horas** (`auth.module.ts` → `expiresIn: '24h'`).
- **Ticket sin relación a Seat**: La info del asiento está codificada en el QR JWT. Para encontrar compradores de un evento hay que decodificar todos los tokens.
- **Pagos Mock**: `PaymentsModule` siempre retorna `true`. Para producción: configurar `STRIPE_SECRET_KEY`.
- **Emails fire-and-forget**: Todos los envíos de email usan `.catch(() => null)` — nunca bloquean el flujo.
- **Anti-enumeración**: `forgot-password` y `resend-verification` siempre retornan el mismo mensaje (200) independientemente de si el email existe o no.
- **ValidationPipe Global**: `main.ts` tiene `whitelist: true`. Para el PATCH de eventos se usa `@Request()` para evitar que se filtren los campos de zona.
- **Directorios de uploads**:
  - `uploads/organizers/{id}/logo/` — logo de la organización
  - `uploads/organizers/{id}/events/{eventId}/` — imágenes de eventos
  - `uploads/organizers/{orgId}/members/{memberId}/avatar/` — avatares de miembros
  - `uploads/users/{id}/avatar/` — fotos de perfil de clientes
  - `uploads/banners/` — imágenes de banners publicitarios (UUID + extensión)
- **Bloqueo de organizadores en tiempo real**: `JwtStrategy.validate()` consulta la BD en cada request. Si el organizador está BLOCKED, lanza 401. `fetchAPI` en web-host intercepta el 401 y limpia localStorage + redirige a `/login`. Latencia máxima = tiempo hasta el próximo request autenticado.
- **Impersonación — seguridad**: El JWT de impersonación tiene duración 1h (no 24h). Incluye `impersonatedBy: adminId` como campo de auditoría. Si el organizador es bloqueado mientras se impersona, el siguiente request devuelve 401 y cierra la sesión de impersonación automáticamente.
- **Impersonación — React Strict Mode**: En desarrollo, React ejecuta useEffect dos veces. En la segunda ejecución la URL ya es `/dashboard` y el token sería null → redirige a login. Fix: `useRef(done)` previene la doble ejecución en `/auth/impersonate/page.tsx`.
- **Suspense para useSearchParams**: En Next.js 14+, `useSearchParams()` requiere un Suspense boundary para no bloquear el prerender. Patrón aplicado: `export default function Wrapper() { return <Suspense><Page /></Suspense>; }` — aplicado en dashboard y reset-password de ambos paneles.
- **Banners — límite**: máximo 3 banners en la plataforma (validado solo en la UI Admin; no hay guard en el backend)
- **BannerSlider — carga SSR**: `getBanners()` se llama en el server component de `page.tsx` con `.catch(() => [])`. Si la API está caída, la sección de banners simplemente no se renderiza (no lanza error al usuario).
- **Favicons**: SVG puro en `/public/favicon.svg` de las 3 apps. El web-host usa `<link>` en JSX por ser `'use client'` y no poder exportar `metadata`.

---

## 9. Reglas de Negocio — Edición de Zonas

| Campo        | ¿Editable si hay ventas? | Restricción                                         |
| :----------- | :----------------------- | :-------------------------------------------------- |
| Nombre       | No                       | Bloqueado si `soldCount > 0`                        |
| Descripción  | Sí                       | Siempre editable                                    |
| Precio       | No                       | Bloqueado si `soldCount > 0`; oculto si `sellOnSite`|
| Capacidad    | Sí                       | No puede ser menor a `soldCount`; oculto si `sellOnSite` |
| sellOnSite   | No                       | Bloqueado si `soldCount > 0`; fuerza price/capacity=0 en backend |
| Nueva Zona   | Sí                       | Se puede agregar zonas nuevas siempre               |
| Eliminar Zona| No (con ventas)          | Solo si la zona no tiene tickets vendidos           |

### Comportamiento sellOnSite

Cuando `sellOnSite: true` en una zona:
- **Backend**: guarda `price: 0, capacity: 0`, no crea asientos (`seats`)
- **Web Host**: oculta inputs de precio y capacidad; checkbox deshabilitado si hay ventas activas
- **Web Client**: muestra píldora verde "🎟️ Entradas disponibles en el lugar y día del evento" en lugar del selector de asientos/precio; la zona no contribuye al cálculo de compra online (`allZonesFree`)

---

## 10. Próximos Pasos de Desarrollo

### Prioridad Alta

- [ ] Integración real con Stripe (reemplazar el mock)
- [ ] Reportes financieros para organizadores
- [x] ~~Deploy en VPS (Dockerfiles + docker-compose.prod.yml + Nginx + SSL)~~ → **Deploy en Coolify completado (30 May 2026)**
- [x] ~~Dockerfiles frontends con output standalone~~ ✅ (30 May 2026)
- [x] ~~Deploy frontends en Coolify~~ ✅ (30 May 2026) → `https://afroeventos.com`, `https://host.afroeventos.com`, `https://admin.afroeventos.com`

### Prioridad Media

- [x] ~~Sistema de categorías de eventos~~ ✅ (2 Jun 2026)
- [x] ~~Optimizar queries de findAll (no traer todos los seats)~~ ✅ (3 Jun 2026) → `_count` aggregate en zonas del listado; `GET /events/:slug` sin cambios (sigue cargando seats para el mapa de asientos)
- [x] ~~Galería de imágenes en edición: evitar acumulación de imágenes al reeditar~~ ✅ (3 Jun 2026) → snapshot de URLs antes de la escritura + `deleteOrphanedImageFiles()` solo si la transacción Prisma fue exitosa
- [x] ~~Paginación en endpoints restantes: `GET /orders` y `GET /orders/attendees/me`~~ ✅ (5 Jun 2026) → ambos ya devuelven `{ data, total, page, limit, totalPages }`. `GET /orders` pagina en BD (skip/take); `GET /orders/attendees/me` ahora filtra por la nueva columna `Ticket.eventId` en vez de escanear toda la tabla de tickets
- [x] ~~Deuda técnica: `Ticket` sin `eventId` en BD~~ ✅ (5 Jun 2026) → columnas `eventId`, `zoneName`, `seatNumber` agregadas a `Ticket` (indexadas); elimina la necesidad de decodificar todos los QR JWT para `attendees/me` y para notificaciones de cambio de evento

### Prioridad Baja

- [ ] Websockets para actualización en tiempo real del mapa de asientos
- [ ] Rate limiting en API
- [ ] CI/CD pipeline
- [ ] Tests unitarios e integración

### Completado

- Generar imagen QR real con librería `qrcode` ✅
- Búsqueda y filtrado de eventos ✅
- Upload de imágenes para eventos ✅
- Edición y eliminación de eventos ✅
- Gestión de estados (Draft/Published/Inactive) ✅
- Desactivación automática de eventos pasados ✅
- Edición de descripciones de zonas ✅
- Protección de capacidad (no reducir bajo vendidos) ✅
- Panel Global Admin: aprobar, editar, eliminar organizadores ✅
- Gestión de Planes en Global Admin (CRUD completo) ✅
- Planes dinámicos en registro de Host ✅
- Gestión de Usuarios del Dashboard (Admins y Editores con roles) ✅
- Página Mi Perfil para usuarios (Portal Cliente) ✅
- Página Asistentes en Panel Host ✅
- Escáner de Tickets en Panel Host (cámara, ID corto, token manual) ✅
- Gestión de OrganizerMembers en Panel Host ✅
- Página Perfil en Panel Host ✅
- Hero Section con carrusel coverflow 3:4 ✅
- Sección Eventos Destacados (web-client) ✅
- Cron job de expiración de destacados ✅
- Campo portraitImageUrl (imagen retrato 3:4) ✅
- Logo oficial SVG AfroEventos en todas las apps ✅
- Footer rediseñado con redes sociales ✅
- Páginas legales (políticas de privacidad, términos y condiciones) ✅
- URL Slugs amigables para eventos ✅
- Rebrand completo a AfroEventos ✅
- NX Daemon hot-reload activo ✅
- **Emails transaccionales — sistema completo (13 templates)** ✅ (24 May 2026)
- **Auth flow: verify email, forgot/reset password en 3 paneles** ✅ (24 May 2026)
- **URL frontend `/eventos/` en español (migración de `/events/`)** ✅ (24 May 2026)
- **Favicons AfroEventos en las 3 apps (SVG oficial)** ✅ (24 May 2026)
- **Sistema de Banners Publicitarios full-stack (backend + admin CRUD + web-client slider)** ✅ (24 May 2026)
- **Sistema de Categorías de Eventos full-stack (EventCategory model + CategoriesModule + Admin UI + host forms dinámicos + pills inteligentes)** ✅ (2 Jun 2026)
- **SearchBar reescrito: useTransition + loading.tsx + fetches paralelos + fix bug cascada de pushes** ✅ (2 Jun 2026)
- **Fix filtro por categoría: key prop EventsGrid + destacados independientes del filtro** ✅ (2 Jun 2026)
- **Fix buscador: eventos destacados que coinciden con búsqueda ya no se ocultan** ✅ (2 Jun 2026)
- **Fix login: distingue "correo no existe" de "contraseña incorrecta"** ✅ (2 Jun 2026)
- **Banner slider: zoom hover eliminado + etiqueta "Publicidad" en esquina inferior derecha** ✅ (2 Jun 2026)
- **FeaturedEventsSection — 3 layouts adaptativos (1 horizontal / 2 side-by-side / 3+ carrusel)** ✅ (25 May 2026)
- **FeaturedCarousel — carrusel deslizante con scroll infinito, auto-avance y dots dorados** ✅ (25 May 2026)
- **EventsGrid — grid paginado con botón "Mostrar más", última fila centrada** ✅ (25 May 2026)
- **Header "Próximos Eventos" condicional (sobre destacados cuando no hay generales)** ✅ (25 May 2026)
- **OrganizerCTA — sección CTA para organizadores al final del homepage (neuromarketing)** ✅ (25 May 2026)
- **Navbar dropdown: username reemplaza "Mi Perfil", despliega Mi Perfil + Salir** ✅ (25 May 2026)
- **Web-Host login: "Organizador", sin subtítulo, logo linkea al Portal de Clientes** ✅ (25 May 2026)
- **Upload zones: proporciones visuales con aspect-ratio (banner 126:36, cuadrada 1:1, retrato 3:4)** ✅ (25 May 2026)
- **Icono de calendario blanco en inputs datetime del Web-Host** ✅ (25 May 2026)
- **Galería de eventos rediseñada: imagen principal + thumbnails, adapta aspect ratio, 1 img = simple** ✅ (25 May 2026)
- **sellOnSite en zonas: full-stack (schema, DTO, API, Web-Host forms, Web-Client display)** ✅ (25 May 2026)
- **Tipo de localidad por defecto "Entradas" (no "Asientos Numerados"), precio/capacidad por defecto 0** ✅ (25 May 2026)
- **Bloqueo de Organizadores full-stack** — enum BLOCKED, JWT strategy verifica en cada request, 401 auto-logout en web-host, botón 🔒/🔓 en admin ✅ (25 May 2026)
- **Modales personalizados** — UIHelpers.tsx (web-host), ConfirmModal/InputModal/ToastStack inline (web-admin); eliminados todos los confirm/alert/prompt nativos ✅ (25 May 2026)
- **Persistencia de vista en URL** — `?view=X` en ambos dashboards (web-admin y web-host), Suspense boundary para useSearchParams ✅ (25 May 2026)
- **Badge sidebar "Organizador"** (antes "HOST") + logo -10% tamaño ✅ (25 May 2026)
- **Impersonación de Organizadores** — endpoint `/admin/organizers/:id/impersonate` JWT 1h, botón 👁 en web-admin, `/auth/impersonate` auto-login, ImpersonationBanner morado en web-host ✅ (25 May 2026)
- **Control de Pasarela de Pagos** — SystemConfig singleton, override por org (null/true/false), toggle global en admin UI, card + columna "Pagos" en tabla de orgs, banner naranja + precio/capacidad bloqueados en formularios web-host, enforcement backend ✅ (25 May 2026)
- **Límite de eventos por plan — conteo anual por aniversario** — helper `getAnnualPeriodStart()`, cuenta eventos desde la última fecha de aniversario del perfil, error message incluye fecha de renovación en español ✅ (25 May 2026)
- **Paginación real en API** — `GET /events`, `GET /admin/organizers`, `GET /admin/events` devuelven `{ data, total, page, limit, totalPages }`; `GET /events` filtra solo PUBLISHED en BD ✅ (28 May 2026)
- **EventsGrid paginación real** — muestra 3 por fila (ROW_SIZE), carga 12 del API cuando se agotan; filtra `excludeIds` para no duplicar destacados; `useState<boolean>` para deshabilitar botón correctamente ✅ (28 May 2026)
- **generalTotal correcto** — si todos los eventos caben en página 1 usa conteo exacto; si hay más páginas estima `total - featured.length` ✅ (28 May 2026)
- **Dashboard admin paginación** — controles Anterior/Siguiente en tablas; funciones sin default params para evitar stale closure ✅ (28 May 2026)
- **Sistema de imágenes configurable desde .env** — `STORAGE_PROVIDER` (local/cloudinary), `NEXT_PUBLIC_MAX_UPLOAD_MB`, `NEXT_PUBLIC_ALLOWED_IMAGE_TYPES`, `UPLOAD_IMAGE_QUALITY`; validación en frontend + backend ✅ (28 May 2026)
- **Sharp WebP** — toda imagen subida se convierte a WebP con calidad configurable; escritura atómica via `.tmp` para evitar corrupción ✅ (28 May 2026)
- **Cloudinary listo** — cuando `STORAGE_PROVIDER=cloudinary`, Sharp comprime primero y luego sube el WebP; credenciales en `.env` ✅ (28 May 2026)
- **Code review — 7 bugs corregidos** — WebP corrupción, doble URL encoding en búsqueda, generalTotal, useTransition async, stale closure, queries redundantes en create(), role type cleanup ✅ (28 May 2026)
- **Hydration warning fix** — `suppressHydrationWarning` en `<body>` de los 3 layouts; soluciona warning de extensiones del navegador ✅ (28 May 2026)
- **API desplegada en producción (Coolify)** — `https://api.afroeventos.com/api` — Docker multistage, Prisma generate en builder, OpenSSL en runtime, volumen persistente `/app/uploads`, variables de entorno configuradas, PostgreSQL + Redis internos ✅ (30 May 2026)
- **Dockerfiles frontends para Coolify** — `apps/{web-client,web-host,web-admin}/Dockerfile` con `output: 'standalone'`, ARGs para NEXT_PUBLIC_*, runner stage mínimo en node:20-alpine ✅ (30 May 2026)
- **EventCard sin precios** — eliminada función `getMinPrice()` y bloque JSX de precio en `EventCard.tsx`; el precio se descubre en el detalle de evento ✅ (30 May 2026)
- **Hover shadows navbar eliminados** — removidos `box-shadow`, `transform: translateY` y fondo oscuro del hover de botones auth; root cause: `padding + background` en wrapper `<a>` de `.navbar-links`; fix: selectores ID de alta especificidad en `global.css` ✅ (30 May 2026)
- **Logos clicables en sidebars** — logos de `web-host/Sidebar.tsx` y `web-admin/Sidebar.tsx` abren el Portal de Clientes en nueva pestaña vía `<a href={NEXT_PUBLIC_SITE_URL}>` ✅ (30 May 2026)
- **Logo footer clicable** — `AfroEventosLogo` en `Footer.tsx` envuelto en `<Link href="/">` ✅ (30 May 2026)
- **`.tsbuildinfo` excluido de git** — `*.tsbuildinfo` añadido a `.gitignore`, archivos destrackeados con `git rm --cached` ✅ (30 May 2026)

---

## 11. Bugs Conocidos / Deuda Técnica

- ~~**Ticket sin relación a Seat en BD**: Requiere decodificar todos los JWTs para encontrar compradores de un evento~~ ✅ **Resuelto (5 Jun 2026)**: `Ticket` ahora tiene columnas `eventId` (indexada), `zoneName` y `seatNumber`. `getMyEventAttendees` y `notifyBuyersOfChange` filtran por `eventId` en BD y leen zona/asiento de columnas. Se mantiene fallback de decodificación JWT para tickets antiguos con columna nula (transición sin downtime). Backfill: `node scripts/backfill-ticket-event.js` (idempotente). El `seatId` sigue solo en el QR JWT (no se usa en lecturas).
- **Límite de 3 banners no validado en backend**: El límite existe solo en la UI Admin. Un POST directo a `/api/banners` podría crear más de 3. Mejora futura: agregar validación en `BannersService.create()`.
- **BannerSlider sin transición entre slides**: El cambio de imagen es abrupto (no hay fade ni slide). Mejora futura: añadir `opacity` o `translateX` entre slides.
- **FeaturedCarousel — límite de 3 tarjetas visibles fijo**: En pantallas muy anchas podría mostrarse espacio vacío. Mejora futura: hacer `VISIBLE` responsivo.
- **Archivos subidos pero no guardados (edit)**: Si el usuario sube una imagen durante la edición de un evento pero no guarda el formulario, el archivo queda huérfano en disco. Requiere job periódico de limpieza.

### Completado en Sesión 19 (5-6 Jun 2026) — Deuda técnica eventId + Sistema de Imágenes + De-dup CSS

- **`Ticket.eventId/zoneName/seatNumber` denormalizado** — paginación real de `getMyEventAttendees` (filtra por columna en BD, ya no carga toda la tabla) y `notifyBuyersOfChange` sin decodificar todos los JWT; fallback JWT para tickets antiguos; backfill `scripts/backfill-ticket-event.js` ✅
- **Resize server-side por tipo (Sharp `kind`)** — cuadrada 1080×1080, retrato 1200×1600, banner/avatar/logo cover; **banner de evento sin recorte** (cap de ancho, proporción natural); `.rotate()` EXIF ✅
- **Banner a proporción natural en cliente y host** — detalle (`.event-detail-hero`), tarjeta de 1 destacado (`.featured-card-h`) y preview del host se adaptan a la imagen; tarjeta de 2 destacados + caja de subida a `3/1` (coherente con recomendación 1500×500) ✅
- **Aviso de resolución mínima** no bloqueante en formularios de evento (banner solo ancho ≥1500) ✅
- **Etiquetas con tamaño recomendado** — Banner 1500×500 (3:1), Cuadrada 1080×1080 (1:1), Retrato 1200×1600 (3:4) ✅
- **`uploads/` sacado de git tracking** (commit `6536faf`) — alinea con `.gitignore`; producción usa volumen `afroeventos-uploads`. Backup local en `D:\AFROEVENTOS\backups\uploads-2026-06-05` ✅
- **De-dup CSS de tickets** — eliminado bloque duplicado de `global.css` (`.tickets-grid`/`.ticket-*`/`.order-*`/`.qr-*`); `my-tickets.css` queda como única fuente; fix grilla 2↔3 columnas no determinista ✅
- ⚠️ **Pendiente en producción**: `npx prisma db push` (lo aplica el CMD del Dockerfile al desplegar) + `node scripts/backfill-ticket-event.js` en el contenedor `afroeventos-api`. Los cambios de la sesión ya están commiteados y pusheados a `origin/main` (Coolify auto-despliega).

### Completado en Sesión 18 (3 Jun 2026) — Validación de Formularios + UX Registro Host

- **Validación de teléfono en backend** — `auth.dto.ts`: `@Matches(/^\+?[0-9][\d\s\-()+.]{5,14}$/)` en `RegisterDto`, `RegisterHostDto`, `UpdateBasicInfoDto` y `UpdateProfileDto`; el API rechaza con 400 cualquier teléfono inválido ✅
- **Validación de teléfono en frontend (6 archivos)** — `type="tel"` + `pattern` + `minLength={7}` + `maxLength={16}` + `title` en: web-client register, web-client my-profile, web-host register, web-admin dashboard (4 modales: editar asistente, editar org, crear org, crear/editar usuario admin) ✅
- **`minLength={6}` en password web-admin login** — el único formulario de login que le faltaba ✅
- **web-host registro — etiquetas simplificadas** — "Continuar a Detalles de Empresa →" → "Continuar a Detalles →"; "Finalizar Registro 🚀" → "Finalizar 🚀" ✅
- **web-host registro — campo teléfono con prefijo** — "Teléfono de Soporte Comercial" → "Teléfono"; input rediseñado con prefijo `🇪🇨 +593` separado (mismo patrón que web-client register) ✅
- **generalTotal estimado (no exacto) cuando hay múltiples páginas**: Si hay eventos destacados en páginas 2+, el "Mostrar más" puede aparecer un clic de más antes de terminar. Impacto mínimo — solo un fetch extra vacío.

---

### Completado en Sesión 16 (3 Jun 2026) — Deuda Técnica

- **`.env` sacado de git tracking** — `git rm --cached .env .env.local`; `.env.example` con las 20 variables y valores placeholder; advertencia: JWT_SECRET, MAIL_PASS y credenciales de DB ya estaban en historial → deben rotarse externamente ✅
- **`findAll` optimizado con `_count` aggregate** — `events.service.ts`: `GET /events` ya no carga filas de asientos; `zones.soldCount` calculado con `_count: { select: { seats: { where: { isSold: true } } } }`; `EventDetailClient` y `EventCard` usan `soldCount` en el listado con fallback a `seats[]` en el detalle ✅
- **Limpieza de imágenes huérfanas generalizada** — `events.service.ts`: constante `IMAGE_FIELDS` (5 campos + gallery), `collectImageUrls()`, `deleteOrphanedImageFiles()`; `update()` hace snapshot antes de escribir y limpia archivos sobrantes solo tras éxito; `remove()` también borra todos los archivos del evento eliminado ✅
- **`as any` eliminados (8 casts)** — reemplazados con `EventStatus`, `HostStatus`, `TicketStatus` de `@prisma/client`; fix colateral: `HostStatus` en `admin.controller.ts` ahora incluye `BLOCKED` (antes faltaba) ✅

### Completado en Sesión 17 (3 Jun 2026) — UX Responsive Portal Cliente + Admin

- **Imagen 1:1 en detalle de evento (móvil portrait)** — `EventDetailClient.tsx`: dos `<img>` con clases `.event-detail-hero-banner` / `.event-detail-hero-square`; CSS `@media (max-width: 640px) and (orientation: portrait)` muestra la imagen cuadrada con `aspect-ratio: 1/1` ✅
- **Título de evento responsive** — `global.css`: `font-size: clamp(1.75rem, 5vw + 1rem, 3rem)` + `line-height: 1.1` en `.event-detail h1`; elimina el gap excesivo entre líneas heredado del `line-height: 1.6` del body ✅
- **Hero carousel oculto en móvil + mejoras tablet** — `global.css`: `.hero-split-right { display: none }` en `≤640px`; en `≤960px`: `transform: none` en `.hero-split-left` (elimina scale 0.9), `max-width: 600px` en subtítulo, carousel height `460px`, offsets de tarjetas laterales `64%` (mejor peek en ancho completo) ✅
- **Márgenes en sección Destacados** — `global.css`: `padding: 0 1.5rem` en `≤960px` y `padding: 2.5rem 1rem 0` en `≤640px` para `.featured-section`; `.featured-two-grid` apila en columna única en móvil ✅
- **`featured-card-h` sin recorte de imagen** — `object-fit: contain` en `.featured-card-h-img img`; el banner panorámico se muestra completo con fondo `#121314` en las áreas vacías ✅
- **Logo admin login clicable** — `apps/web-admin/app/login/page.tsx`: `AfroEventosLogo` envuelto en `<a href={NEXT_PUBLIC_SITE_URL}>` con `title="Ir al portal de clientes"` ✅
- **Botón "Ya tengo cuenta" en OrganizerCTA** — `OrganizerCTA.tsx`: segundo botón ghost `→ HOST_URL/login` con `target="_blank"`; `global.css`: `.octa-cta-group` flex-wrap + override de padding para ambos botones ✅
