<p align="center">
  <img src="client/public/logo.png" alt="TransitOps" width="260" />
</p>

<h1 align="center">TransitOps</h1>

<p align="center">
  <strong>Smart Transport Operations Platform</strong><br/>
  Fleet, drivers, dispatch, maintenance, fuel &amp; expenses, and cost analytics — in one role-aware dashboard.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-self--hosted-4169e1?logo=postgresql&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ESM-f7df1e?logo=javascript&logoColor=black" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Feature Highlights](#feature-highlights)
- [Roles &amp; Permissions (RBAC)](#roles--permissions-rbac)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Business Rules &amp; Validation](#business-rules--validation)
- [Analytics &amp; KPI Formulas](#analytics--kpi-formulas)
- [Getting Started](#getting-started)
- [Demo Accounts](#demo-accounts)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [NPM Scripts](#npm-scripts)
- [Security Notes](#security-notes)
- [Design System](#design-system)

---

## Overview

**TransitOps** is a full-stack operations platform for a transport company. It centralizes the day-to-day
workflows of running a vehicle fleet: registering vehicles and drivers, dispatching trips with real safety and
capacity checks, tracking maintenance and running costs, and turning all of it into cost & ROI analytics — behind
a secure, role-based login where every user sees only what their job allows.

The application is a **two-package project**:

| Package    | What it is                        | Runs on                 |
| ---------- | --------------------------------- | ----------------------- |
| `client/`  | Next.js 16 App Router frontend    | `http://localhost:3000` |
| `server/`  | Node.js + Express 5 REST API      | `http://localhost:4000` |

Data lives in a **self-hosted PostgreSQL** database accessed through **Prisma**. No backend-as-a-service
(Firebase / Supabase / Mongo Atlas), no ORM-free string SQL — a clean, typed, migration-driven schema.

---

## Feature Highlights

- 🔐 **Authentication & RBAC** — email/password login (bcrypt), stateless JWT in an **HTTP-only cookie**, CSRF
  double-submit protection, and a **server-enforced permission matrix** for four distinct roles. Menus and actions
  are shown/hidden by role in the UI, but every request is authorized again on the backend.
- 📊 **Operations dashboard** — fleet KPIs, vehicle-status breakdown, and a recent-trips feed at a glance.
- 🚚 **Vehicle registry** — full CRUD, per-vehicle detail page, status lifecycle (`Available → On Trip → In Shop → Retired`),
  search/filter by type, status and region, and **document management** (insurance, RC, PUC… with expiry dates).
- 🧑‍✈️ **Driver management** — full CRUD, license tracking with expiry, safety scores, and status
  (`Available / On Trip / Off Duty / Suspended`), with search.
- 🗺️ **Trip management** — a dispatch board with the **complete trip lifecycle** (`Draft → Dispatched → Completed / Cancelled`)
  enforced atomically, plus revenue and odometer capture for downstream analytics.
- 🔧 **Maintenance** — service logs that move a vehicle **In Shop** while open and restore it on close, with a
  searchable/filterable service history.
- ⛽ **Fuel & Expense tracking** — fuel logs and categorized expenses per vehicle/trip, feeding the cost engine.
- 📈 **Analytics & reports** — Fuel Efficiency, Fleet Utilization, Operational Cost and Vehicle ROI KPIs, monthly
  revenue and top-cost charts (pure CSS/SVG — no charting dependency), a per-vehicle breakdown, and **CSV + PDF export**.
- 🌗 **Light / dark theme** — light by default with a one-click toggle; the choice persists and applies before first paint.
- ✅ **Toasts & robust error handling** — success/failure feedback on every mutation and a consistent API error shape.

---

## Roles & Permissions (RBAC)

Roles are named exactly as in the brief. The matrix below is the **authoritative, server-enforced** access table
(`server/src/constants/permissions.js`). `C` = create, `R` = read, `U` = update, `D` = delete; trip verbs are
`dispatch / complete / cancel`.

| Module        | Fleet Manager | Driver (Dispatcher)          | Safety Officer | Financial Analyst |
| ------------- | :-----------: | :--------------------------: | :------------: | :---------------: |
| Dashboard     | R             | R                            | R              | R                 |
| Vehicles      | **CRUD**      | R                            | R              | R                 |
| Drivers       | R             | R                            | **CRUD**       | R                 |
| Trips         | R             | **CR-U + dispatch/complete/cancel** | R       | R                 |
| Maintenance   | **CRUD**      | –                            | –              | R                 |
| Fuel          | R             | CR                           | –              | **CRUD**          |
| Expenses      | R             | CR                           | –              | **CRUD**          |
| Reports       | R             | R                            | R              | R                 |

> The UI mirrors this table to filter the sidebar and hide actions, but enforcement always happens on the API via the
> `authorize(module, action)` middleware — the client is never trusted.

---

## Tech Stack

**Frontend**
- Next.js `16.2.10` (App Router, React Server Components) · React `19`
- JavaScript only (no TypeScript) · Tailwind CSS `v4`
- Server-side session guard + cookie-forwarding data layer (`next/headers`)

**Backend**
- Node.js + Express `5` · JavaScript (CommonJS)
- Prisma `6` ORM over PostgreSQL
- `jsonwebtoken` (JWT), `bcryptjs` (hashing), `cookie-parser`, `cors`
- `zod` for request validation · `pdfkit` for PDF export

**Database**
- Self-hosted **PostgreSQL** · migration-driven schema · enums for statuses/roles/types · `Decimal(12,2)` for money

---

## Architecture

```
┌─────────────────────────┐        credentialed fetch         ┌──────────────────────────┐
│   Next.js client :3000   │  ── HTTP-only cookie + CSRF ──▶   │   Express API :4000       │
│                          │                                   │                           │
│  Server Components ──────┼── forward cookies (next/headers) ─┤  routes → controllers →   │
│  Client Components       │ ◀──────── JSON responses ──────── │  services → data-access   │
└─────────────────────────┘                                   └───────────┬──────────────┘
                                                                           │ Prisma
                                                                  ┌────────▼─────────┐
                                                                  │  PostgreSQL       │
                                                                  └───────────────────┘
```

**Backend is strictly layered** — each feature is a self-contained module under `server/src/modules/<name>/`:

```
routes  →  controllers  →  services  →  data-access (Prisma)
   │            │              │
   │            │              └─ business rules, transactions, cross-row validation
   │            └─ HTTP shape only: parse, call service, send response (asyncHandler)
   └─ URL map + authenticate + authorize(module, action) + CSRF guard + zod validation
```

Cross-cutting pieces: `middleware/` (`authenticate`, `authorize`, `errorHandler`), `constants/` (`roles`, `permissions`),
`utils/` (`AppError`, `asyncHandler`), `lib/prisma.js` (singleton client), `config/env.js` (all config in one place).

State transitions (dispatch a trip, open/close maintenance) run inside a **Prisma `$transaction`** so a vehicle's/driver's
status and the record it depends on can never drift out of sync. All KPI numbers are **derived with grouped queries**,
never stored, so they can't go stale.

---

## Data Model

Eight core entities plus a documents table. Tables/columns are `snake_case` in the DB (`@map`/`@@map`); the JS client
stays `camelCase`.

```
Role 1───* User ─────────────┐ (created_by on operational records)
                             │
Vehicle 1───* Trip *───1 Driver
   │  │  │        │  │
   │  │  │        │  └──* Expense
   │  │  │        └─────* FuelLog
   │  │  └──────────────* MaintenanceLog
   │  └─────────────────* VehicleDocument
   └────────────────────* (Expense / FuelLog direct to Vehicle too)
```

| Entity            | Purpose                                                                            |
| ----------------- | ---------------------------------------------------------------------------------- |
| `Role`            | The four RBAC roles (seeded lookup).                                               |
| `User`            | App account with a role; author of operational records.                            |
| `Vehicle`         | Fleet asset: type, capacity, odometer, acquisition cost, status, region.           |
| `Driver`          | Driver profile: license number/category/expiry, safety score, status.              |
| `Trip`            | A dispatch: source/destination, cargo, distance, revenue, odometer, lifecycle.     |
| `MaintenanceLog`  | A service event that takes a vehicle in/out of the shop.                            |
| `FuelLog`         | Fuel purchase (liters, cost, odometer) per vehicle/trip.                            |
| `Expense`         | Categorized cost (toll, parking, insurance, fine…) per vehicle/trip.               |
| `VehicleDocument` | Compliance docs (insurance/RC/PUC) with reference number, link and expiry.         |

**Schema design decisions**
- **Enums, not free text**, for every status/role/type → clean and queryable.
- **`Decimal(12,2)` for all money**, never `Float`.
- **Referential integrity**: master data (`Vehicle`/`Driver`/`Role`) uses `onDelete: Restrict`; optional authorship links
  use `SetNull`; a vehicle's documents `Cascade`.
- **Indexes** on every common filter (status, region, type, dates, foreign keys).
- **DB `CHECK` constraints** (migration `add_check_constraints`) for invariants that don't depend on other rows
  (positive amounts, non-negative odometer, etc.); cross-row rules live in the service layer.

Full schema: [`server/prisma/schema.prisma`](server/prisma/schema.prisma).

---

## Business Rules & Validation

Validation is layered: **zod** rejects malformed input at the edge, the **service layer** enforces rules that need
related rows, and the **database** enforces the last-line invariants.

- **Trip dispatch** requires an `AVAILABLE` vehicle **and** an `AVAILABLE` driver whose **license is not expired**;
  cargo weight must not exceed the vehicle's `maxLoadCapacity`.
- Dispatch flips the vehicle & driver to **On Trip** and stamps the start odometer; **complete** returns them to
  Available and captures final odometer/fuel; **cancel** restores prior state — all atomic.
- **Opening maintenance** moves a vehicle to **In Shop**; **closing** returns it to Available unless it's retired or
  still has other open work.
- Money and quantities must be **positive**; enums are constrained to their allowed values.
- Unauthorized actions return a **403 with a role-aware message**; unknown routes return a standard **404** shape.

---

## Analytics & KPI Formulas

All metrics are computed on demand from grouped queries (see `server/src/modules/reports/`):

| Metric                | Formula                                                                              |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Operational Cost**  | `SUM(fuel.cost) + SUM(maintenance.cost) + SUM(expenses.amount)` per vehicle          |
| **Fuel Efficiency**   | `(final_odometer − start_odometer) / fuel_consumed` (fallback: planned distance)     |
| **Vehicle ROI**       | `(SUM(revenue) − (SUM(maintenance) + SUM(fuel))) / acquisition_cost`                 |
| **Fleet Utilization** | `vehicles ON_TRIP / total non-retired vehicles`                                      |
| **Profitability**     | `revenue − operational cost` per vehicle                                             |

Exportable as **CSV** and **PDF** from the Analytics page.

---

## Getting Started

### Prerequisites

- **Node.js 20+** and npm
- **PostgreSQL 14+** running locally (self-hosted)

### 1. Clone

```bash
git clone https://github.com/codedpool/transit-ops.git
cd transit-ops
```

### 2. Create the database

Create an empty database (any name; the examples use `transitops`):

```sql
CREATE DATABASE transitops;
```

### 3. Backend (`server/`)

```bash
cd server
npm install

# configure environment
cp .env.example .env
#  → edit .env and set DATABASE_URL to your Postgres connection string
#    and JWT_SECRET to a long random string:
#    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# apply the schema (creates all tables) and generate the client
npx prisma migrate dev
npx prisma generate

# seed roles + demo users, then a demo fleet
npm run seed
node prisma/seed-demo.js

# start the API on http://localhost:4000
npm run dev
```

`server/.env` keys:

| Key                 | Example                                                            | Notes                                  |
| ------------------- | ----------------------------------------------------------------- | -------------------------------------- |
| `DATABASE_URL`      | `postgresql://postgres:PASSWORD@localhost:5432/transitops?schema=public` | URL-encode special chars in the password |
| `PORT`              | `4000`                                                            | API port                               |
| `NODE_ENV`          | `development`                                                     |                                        |
| `JWT_SECRET`        | *(long random string)*                                            | required                               |
| `JWT_EXPIRES_IN`    | `8h`                                                              |                                        |
| `COOKIE_MAX_AGE_MS` | `28800000`                                                        | keep in sync with `JWT_EXPIRES_IN`     |
| `CLIENT_ORIGIN`     | `http://localhost:3000`                                           | CORS allow-list for the client         |

### 4. Frontend (`client/`)

```bash
cd client
npm install

# start Next.js on http://localhost:3000
npm run dev
```

The client defaults to `http://localhost:4000/api`. To point elsewhere, set `NEXT_PUBLIC_API_URL` in `client/.env.local`.

### 5. Open the app

Visit **http://localhost:3000** and sign in with a demo account below.

---

## Demo Accounts

Seeded by `npm run seed`. All share the password **`Passw0rd!`**.

| Role              | Email                       |
| ----------------- | --------------------------- |
| Fleet Manager     | `fleet@transitops.local`    |
| Driver / Dispatch | `dispatch@transitops.local` |
| Safety Officer    | `safety@transitops.local`   |
| Financial Analyst | `finance@transitops.local`  |

Sign in as each to see the RBAC matrix in action — the sidebar and available actions change per role.

---

## API Reference

Base URL: `http://localhost:4000/api`. All routes except `POST /auth/login` require the auth cookie; mutating routes
also require the CSRF header. Responses share a consistent JSON shape and error format.

| Method   | Endpoint                    | Description                            | Guard (module · action)      |
| -------- | --------------------------- | -------------------------------------- | ---------------------------- |
| `GET`    | `/health`                   | Liveness check                         | public                       |
| `POST`   | `/auth/login`               | Log in, set auth + CSRF cookies        | public                       |
| `POST`   | `/auth/logout`              | Clear session                          | authenticated                |
| `GET`    | `/auth/me`                  | Current user + permission map          | authenticated                |
| `GET`    | `/dashboard/summary`        | KPIs, status counts, recent trips      | dashboard · read             |
| `GET`    | `/vehicles`                 | List / filter / search vehicles        | vehicles · read              |
| `GET`    | `/vehicles/:id`             | Vehicle detail                         | vehicles · read              |
| `POST`   | `/vehicles`                 | Create vehicle                         | vehicles · create            |
| `PUT`    | `/vehicles/:id`             | Update vehicle                         | vehicles · update            |
| `DELETE` | `/vehicles/:id`             | Delete vehicle                         | vehicles · delete            |
| `GET`    | `/drivers` · `/drivers/:id` | List / detail                          | drivers · read               |
| `POST`   | `/drivers`                  | Create driver                          | drivers · create             |
| `PUT`    | `/drivers/:id`              | Update driver                          | drivers · update             |
| `DELETE` | `/drivers/:id`              | Delete driver                          | drivers · delete             |
| `GET`    | `/trips` · `/trips/options` | List trips / dispatch form options     | trips · read                 |
| `POST`   | `/trips`                    | Create a draft trip                    | trips · create               |
| `POST`   | `/trips/:id/dispatch`       | Dispatch (atomic status + checks)      | trips · dispatch             |
| `POST`   | `/trips/:id/complete`       | Complete (capture odometer/fuel)       | trips · complete             |
| `POST`   | `/trips/:id/cancel`         | Cancel and restore state               | trips · cancel               |
| `GET`    | `/maintenance` · `/options` | List logs / form options               | maintenance · read           |
| `POST`   | `/maintenance`              | Open a service log (vehicle → In Shop) | maintenance · create         |
| `POST`   | `/maintenance/:id/close`    | Close a log (restore vehicle)          | maintenance · update         |
| `GET`    | `/fuel` · `/fuel/:id` · `/fuel/options` | Fuel logs                  | fuel · read                  |
| `POST`   | `/fuel` · `PUT`/`DELETE` `/fuel/:id`    | Manage fuel logs           | fuel · create/update/delete  |
| `GET`    | `/expenses` · `/expenses/cost-summary`  | Expenses + cost rollup     | expenses · read              |
| `POST`   | `/expenses` · `PUT`/`DELETE` `/expenses/:id` | Manage expenses       | expenses · create/update/delete |
| `GET`    | `/reports/overview`         | Analytics KPIs + chart data            | reports · read               |
| `GET`    | `/reports/export.csv`       | Download report as CSV                 | reports · read               |
| `GET`    | `/reports/export.pdf`       | Download report as PDF                 | reports · read               |
| `GET`    | `/documents?vehicleId=`     | List a vehicle's documents             | vehicles · read              |
| `POST`   | `/documents`                | Add a document                         | vehicles · update            |
| `DELETE` | `/documents/:id`            | Delete a document                      | vehicles · delete            |

---

## Project Structure

```
transit-ops/
├── client/                        # Next.js 16 frontend (JavaScript + Tailwind v4)
│   ├── app/
│   │   ├── (app)/                 # authenticated shell: dashboard, fleet, drivers,
│   │   │                          #   trips, maintenance, fuel-expenses, analytics
│   │   ├── login/                 # public login page
│   │   ├── layout.js              # root layout + pre-paint theme script
│   │   └── globals.css            # Tailwind + light/dark theme tokens
│   ├── components/                # UI: Sidebar, Topbar, ThemeToggle, forms, charts…
│   ├── lib/                       # api.js (server-only fetchers), mutations, permissions, format
│   └── public/                    # logo + login artwork
│
├── server/                        # Express 5 REST API
│   ├── prisma/
│   │   ├── schema.prisma          # data model
│   │   ├── migrations/            # migration history
│   │   ├── seed.js                # roles + demo users
│   │   └── seed-demo.js           # demo fleet, trips, fuel, expenses
│   └── src/
│       ├── modules/<feature>/     # routes → controller → service → validation
│       ├── middleware/            # authenticate, authorize, errorHandler
│       ├── constants/             # roles, permissions matrix
│       ├── config/env.js          # centralized config
│       ├── lib/prisma.js          # Prisma singleton
│       ├── app.js  ·  routes.js  ·  index.js
│       └── .env.example
│
└── README.md
```

---

## NPM Scripts

**server/**

| Script            | Action                                         |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start API with `--watch` (auto-reload)         |
| `npm start`       | Start API                                      |
| `npm run migrate` | `prisma migrate dev`                           |
| `npm run generate`| `prisma generate`                              |
| `npm run seed`    | Seed roles + demo users                        |
| `npm run studio`  | Open Prisma Studio (DB browser)                |

**client/**

| Script          | Action                    |
| --------------- | ------------------------- |
| `npm run dev`   | Start Next.js dev server  |
| `npm run build` | Production build          |
| `npm start`     | Serve the production build|
| `npm run lint`  | ESLint                    |

---

## Security Notes

- **Passwords** hashed with bcrypt; never stored or logged in plaintext.
- **Stateless JWT** delivered in an **HTTP-only, SameSite** cookie — inaccessible to JavaScript, mitigating XSS token theft.
- **CSRF** mitigated with a double-submit token (readable `csrf_token` cookie echoed in an `x-csrf-token` header) on all
  mutating requests.
- **Authorization on every request** via the permission matrix — the frontend hiding a button is UX, not a control.
- **CORS** is locked to the configured client origin with credentials enabled.
- **Secrets** come only from the environment (`server/.env`, git-ignored); a documented `.env.example` is committed instead.

---

## Design System

A single Tailwind `slate`-based palette powers both themes. Instead of annotating every element with `dark:` variants,
the `--color-slate-*` tokens are redefined in `globals.css`: **light mode (the default) inverts the ramp**, and
`:root.dark` restores it. A pre-paint script applies the saved theme before first render (no flash), and the amber accent
plus semantic status colors (green = available/completed, blue = on-trip/dispatched, amber = in-shop/suspended,
red = retired) stay consistent across the app.

---

<p align="center"><sub>Built for the hackathon — TransitOps © 2026</sub></p>
