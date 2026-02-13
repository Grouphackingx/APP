# PROJECT CONTEXT & HANDOVER: OpenTicket (BuenPlan Clone)

**Date:** February 9, 2026
**Purpose:** Instant Context Loading for AI Models or Developers.

---

## 1. Project Vision
**OpenTicket** is an Event Ticketing & Management System (Two-Sided Marketplace), replicating the functionality of `buenplan.com.ec`.

### Core Actors
1.  **Host (Organizer)**: Creates events, manages zones/seats, views financial reports.
2.  **User (Attendee)**: Discovers events, buys tickets (selects seats), receives dynamic QR codes.
3.  **Staff**: Scans QR codes at the gate using an offline-first Mobile App.
4.  **Admin**: Global platform management.

---

## 2. Technology Stack (Enforced)
*   **Monorepo Tool**: Nx (Integrated Repo)
*   **Language**: TypeScript (Strict Mode)
*   **Backend**: NestJS (Node.js)
*   **Frontend Web (User)**: Next.js (App Router)
*   **Frontend Web (Host)**: Next.js (App Router)
*   **Mobile**: React Native (Expo) - *Not yet implemented functionality*
*   **Database**: PostgreSQL 15
*   **Cache/Locks**: Redis 7
*   **ORM**: Prisma
*   **Infra**: Docker Compose

---

## 3. Current Architecture & Progress (Phase 1 Complete)

### Folder Structure
```text
/
├── apps/
│   ├── api/                 # [RUNNING] Port 3000. NestJS Gateway & Logic.
│   ├── web-client/          # [RUNNING] Port 4200. Next.js User Portal.
│   ├── web-host/            # [RUNNING] Port 4201. Next.js Organizer Dashboard.
│   └── mobile-app/          # [SCAFFOLDED] Expo App.
│ 
├── libs/
│   ├── shared/              # [IMPLEMENTED] Shared Types, DTOs, Prisma Schema.
│   └── ui-kit/              # [SCAFFOLDED] Shared React Components.
```

### Infrastructure (Docker)
*   **PostgreSQL**: Port **5435** (Changed from default 5432 to avoid conflicts).
    *   Creds: `postgres` / `password` / DB: `openticket_db`
*   **Redis**: Port **6380** (Changed from default 6379).

### Implemented Features (Backend)
1.  **Shared Library (`@open-ticket/shared`)**:
    *   Contains `LoginDto`, `RegisterDto`, `CreateEventDto`.
    *   Contains the **Prisma Schema** (Source of Truth).
2.  **Auth Module**:
    *   `AuthService`: Login/Register logic.
    *   `JwtStrategy`: Standard Bearer Token strategy.
    *   `JwtAuthGuard`: Protects endpoints.
    *   **JWT Secret**: `superSecretKey123` (Dev).
3.  **Events Module**:
    *   `POST /events`: Create event with Zones & Seats (Transactionally). Protected by Guard.
    *   `GET /events`: List all events. Implementation includes relation loading.

### Database Schema (Key Models)
*   **User**: `id`, `email`, `role`, `password` (hashed).
*   **Event**: `id`, `organizerId`, `zones` (One-to-many).
*   **Zone**: `id`, `price`, `capacity`, `seats`.
*   **Seat**: `id`, `row`, `number`, `isSold`.
*   **Ticket**: `id`, `qrCodeToken`, `status`.

---

## 4. Operational Guide (How to Start)

### 1. Start Infrastructure
```powershell
docker-compose up -d
```

### 2. Database Sync
```powershell
# Using Prisma 5.22.0 (Downgraded from 7.x due to CLI issues)
npx prisma generate --schema=libs/shared/prisma/schema.prisma
npx prisma db push --schema=libs/shared/prisma/schema.prisma
```

### 3. Run Applications
```powershell
# API
npx nx serve api

# Web Client
npx nx serve web-client

# Web Host
npx nx serve web-host --port=4201
```

---

## 5. Immediate Roadmap (Next Steps for AI)
To continue development, the next AI Agent should focus on **Phase 2: Frontend & Booking Engine**.

1.  **Frontend Integration**:
    *   Connect `web-client` to `GET /api/events`.
    *   Build Login/Register forms in Next.js using `axios` or server actions to call backend.
2.  **Concurrency Engine**:
    *   Implement Redis Locking in NestJS when a user selects a seat.
    *   Pattern: `SET lock:seat:{id} {userId} NX EX 600`.
3.  **Ticket Generation**:
    *   Create logic to sign a JWT for the QR code upon successful payment.

---

## 6. Known Issues / Notes
*   **Port Conflicts**: Standard ports (5432, 6379) were busy, so we use **5435** and **6380**.
*   **Prisma Version**: Locked to **5.22.0** to ensure compatibility with the current Node environment and avoid CLI `get-config` errors seen with v7.
*   **Webpack/NestJS**: Uses `npx -y webpack-cli` in `project.json` to ensure the build command finds the CLI.
