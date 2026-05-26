# PUNTO DE RESTAURACIÓN: AfroEventos (Sistema Completo)

**Fecha de Última Actualización:** 25 de Mayo de 2026 (Sesión 5)
**Estado del Proyecto:** COMPLETO Y VERIFICADO — Fases 1-4 + Portal Cliente completo + Panel Host completo + Panel Admin completo + Sistema de Emails Transaccionales completo + Auth flow (verify/forgot/reset password) + URLs `/eventos/` en español + Favicons AfroEventos + Sistema de Banners Publicitarios full-stack + UI/UX Portal Cliente (Destacados Adaptativos + FeaturedCarousel + EventsGrid paginado) + OrganizerCTA + Navbar dropdown + Galería rediseñada + sellOnSite en zonas (full-stack) + Bloqueo de Organizadores (full-stack, sesión inmediata) + Modales personalizados (sin confirm/alert nativo) + Persistencia de vista en URL + Impersonación de Organizadores por Admin

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

| Rol                    | Email                      | Password       | Dónde usarlo                           |
| :--------------------- | :------------------------- | :------------- | :------------------------------------- |
| Administrador Global   | `admin@admin.com`          | `admin123`     | `http://localhost:4202` (web-admin)    |
| Organizador (Host)     | `admin@openticket.com`     | _(restablecer si es necesario)_ | `http://localhost:4201` (Panel Host) |
| Organizador (Host)     | `grouphackingx@gmail.com`  | _(restablecer si es necesario)_ | `http://localhost:4201` (Panel Host) |
| Cliente (User)         | `dmxwilly@gmail.com`       | `willy2024`    | `http://localhost:4200` (Portal Cliente) |
| Cliente (User)         | `cliente@openticket.com`   | `cliente123`   | `http://localhost:4200` (Portal Cliente) |
| Staff (Validator)      | `staff@openticket.com`     | `staff123`     | Mobile App (Expo Go)                   |

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
| GET    | `/api/events`                       | No          | OK     | Listar eventos con zonas y asientos     |
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
| POST   | `/api/upload`                       | Opcional    | OK     | Subir imágenes (logo/event/user-avatar/member-avatar/banner) |
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
| GET    | `/api/admin/organizers`             | JWT (ADMIN/EDITOR) | OK | Listar organizadores                  |
| PATCH  | `/api/admin/organizers/:id/status`  | JWT (ADMIN/EDITOR) | OK | Aprobar / Rechazar / Bloquear organizador |
| POST   | `/api/admin/organizers/:id/impersonate` | JWT (ADMIN) | OK | Generar JWT de 1h para acceder como el organizador |
| GET    | `/api/admin/events`                 | JWT (ADMIN) | OK     | Directorio global de eventos            |
| PATCH  | `/api/admin/events/:id/featured`    | JWT (ADMIN) | OK     | Activar/desactivar evento destacado     |

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
| Crear Evento         | OK     | Formulario completo con zonas, galería, imagen retrato 3:4; tipo por defecto "Entradas", precio/capacidad por defecto 0; checkbox sellOnSite por zona |
| Editar Evento        | OK     | Edición de zonas con protección de ventas activas; checkbox sellOnSite (deshabilitado si hay ventas) |
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
| Gestión de Planes     | OK     | CRUD completo (nombre, precio, límite de eventos)                  |
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
- [ ] Paginación en endpoints (eventos, órdenes, organizadores)

### Prioridad Media

- [ ] Sistema de categorías de eventos
- [ ] Optimizar queries de findAll (no traer todos los seats si no es necesario)
- [ ] CDN para imágenes (actualmente servidas estáticamente desde NestJS)
- [ ] Galería de imágenes en edición: evitar acumulación de imágenes al reeditar

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

---

## 11. Bugs Conocidos / Deuda Técnica

- **Lint warnings `any`**: Múltiples archivos usan `any` type. Funcional pero debería tiparse mejor.
- **Galería de imágenes en edición**: Las imágenes de galería se acumulan en vez de reemplazarse.
- **Ticket sin relación a Seat en BD**: Requiere decodificar todos los JWTs para encontrar compradores de un evento (costoso con muchos tickets). Mejora futura: agregar `eventId` al modelo `Order`.
- **Límite de 3 banners no validado en backend**: El límite existe solo en la UI Admin. Un POST directo a `/api/banners` podría crear más de 3. Mejora futura: agregar validación en `BannersService.create()`.
- **BannerSlider sin transición entre slides**: El cambio de imagen es abrupto (no hay fade ni slide). Mejora futura: añadir `opacity` o `translateX` entre slides (el FeaturedCarousel ya usa translateX como referencia).
- **FeaturedCarousel — límite de 3 tarjetas visibles fijo**: En pantallas muy anchas podría mostrarse espacio vacío a los lados. Mejora futura: hacer `VISIBLE` responsivo (3 en desktop, 2 en tablet, 1 en móvil).
