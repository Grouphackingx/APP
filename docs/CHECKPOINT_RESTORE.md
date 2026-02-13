# 🟢 PUNTO DE RESTAURACIÓN: OPENTICKET (Sistema Completo)

**Fecha de Último Guardado:** 12 de Febrero de 2026
**Estado del Proyecto:** ✅ COMPLETO Y VERIFICADO (Fases 1, 2 y 3 Funcionando)

Este archivo contiene toda la información necesaria para retomar el proyecto y continuar con las pruebas en cualquier momento.

---

## 1. 🚀 Cómo Retomar el Proyecto

Para volver a levantar todo el sistema después de reiniciar tu PC o VS Code:

### Paso 1: Base de Datos (Docker)

Asegúrate de que Docker esté corriendo.

```bash
docker-compose up -d
```

### Paso 2: Generar Prisma Client (solo si es la primera vez o cambiaste el schema)

```bash
npx prisma generate --schema=libs/shared/prisma/schema.prisma
npx prisma db push --schema=libs/shared/prisma/schema.prisma
```

### Paso 3: Seed de Roles (solo primera vez)

Si la BD está vacía, registrar usuarios y asignar roles:

```bash
# Registrar usuarios via API (con el API corriendo) o ejecutar:
node scripts/seed-roles.js
```

### Paso 4: Iniciar Servidores

Abre 3 terminales en VS Code (`Ctrl+Shift+ñ`) y ejecuta:

**Terminal 1: Backend (API)**

```bash
npx nx serve api
```

_(Espera a que diga "Nest application successfully started")_

**Terminal 2: Web Client (Usuarios)**

```bash
npx nx dev web-client --no-dte
```

_(Accesible en http://localhost:4200)_

**Terminal 3: Web Host (Organizadores)**

```bash
npx next dev --port=4201
```

_(Ejecutar desde `apps/web-host/`. Accesible en http://localhost:4201)_

### Paso 5: Iniciar App Móvil (Staff)

Para probar el escáner de QR:

```bash
cd apps/mobile-app
npx expo start
```

_(Usa la App "Expo Go" en tu celular para escanear el QR de la terminal)_

---

## 2. 🧪 Datos de Prueba (Credenciales)

Puedes usar estos usuarios pre-creados o registrar nuevos:

| Rol                    | Email                    | Password     | Función                              |
| :--------------------- | :----------------------- | :----------- | :----------------------------------- |
| **Organizador (Host)** | `admin@openticket.com`   | `admin123`   | Crear eventos en `localhost:4201`    |
| **Cliente (User)**     | `cliente@openticket.com` | `cliente123` | Comprar entradas en `localhost:4200` |
| **Staff (Validator)**  | `staff@openticket.com`   | `staff123`   | Escanear QRs en Mobile App           |

---

## 3. 📦 Estado de la Implementación (Verificado ✅)

### Backend (NestJS) ✅

- **Auth**: Login JWT y Registro funcionando.
- **Eventos**: CRUD completo, soporte de zonas y asientos.
- **Ventas**: Bloqueo de asientos con Redis (10 min), Transacciones atómicas en Postgres.
- **Pagos**: Módulo `/payments` simulando Stripe (siempre aprueba).
- **Validación**: Endpoint `/tickets/validate` para APP Móvil.

### API Endpoints Verificados

| Método | Endpoint                   | Estado | Descripción                          |
| :----- | :------------------------- | :----- | :----------------------------------- |
| GET    | `/api`                     | ✅ OK  | Health check                         |
| POST   | `/api/auth/register`       | ✅ OK  | Registro de usuario                  |
| POST   | `/api/auth/login`          | ✅ OK  | Login JWT                            |
| GET    | `/api/events`              | ✅ OK  | Listar eventos                       |
| GET    | `/api/events/:id`          | ✅ OK  | Detalle de evento con zonas/asientos |
| POST   | `/api/events`              | ✅ OK  | Crear evento (requiere JWT HOST)     |
| POST   | `/api/orders/lock-seats`   | ✅ OK  | Bloquear asientos (Redis 10 min)     |
| POST   | `/api/orders/unlock-seats` | ✅ OK  | Liberar asientos                     |
| POST   | `/api/orders/purchase`     | ✅ OK  | Comprar tickets (genera QR JWT)      |
| GET    | `/api/orders`              | ✅ OK  | Obtener órdenes del usuario          |
| POST   | `/api/tickets/validate`    | ✅ OK  | Validar ticket QR (VALID → USED)     |

### Frontend Web (Next.js) ✅

- **Cliente**: Catálogo de eventos, mapa de asientos interactivo, cuenta regresiva, confirmación de compra con QR.
- **Host**: Dashboard oscuro ("Dark Premium"), creación de eventos, gestión de zonas.

### Mobile App (React Native / Expo) ✅

- **Login**: Autenticación para Staff.
- **Scanner**: Uso de cámara para leer QRs.
- **Validación**: Feedback visual (Verde/Rojo) al validar tickets contra el backend.

---

## 4. 📝 Notas para el Desarrollador

- **Persistencia**: Los datos (usuarios, eventos, tickets) se guardan en el volumen de Docker `openticket_postgres_data`. No se pierden al reiniciar.
- **Pagos Mock**: El sistema de pagos es una simulación. Para pasar a producción, configurar `STRIPE_SECRET_KEY` en `.env`.
- **API URL en Móvil**: La app móvil detecta automáticamente tu IP local si usas Expo Go. Si falla la conexión, revisa `apps/mobile-app/src/app/services/api.ts`.
- **Puertos**: PostgreSQL en **5435**, Redis en **6380** (no estándar para evitar conflictos).
- **Prisma**: Versión **5.22.0** (bloqueado por compatibilidad).
- **Web Host TUI**: Si `npx nx dev web-host` no funciona, usar directamente `npx next dev --port=4201` desde `apps/web-host/`.
