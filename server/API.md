# TransitOps API Reference

Base URL: `http://localhost:4000/api`

All responses are JSON. Errors use a consistent shape:

```json
{ "error": { "message": "human readable", "code": "MACHINE_CODE", "details": [] } }
```

## Auth & sessions

Authentication is a signed JWT delivered in an **HTTP-only cookie** (`token`) — JavaScript
cannot read it, which mitigates XSS token theft. The server is otherwise stateless (no
server-side session store), so it scales horizontally.

CSRF uses the **double-submit** pattern: login also sets a readable `csrf_token` cookie and
returns the same value in the body. For every state-changing request (`POST`/`PUT`/`PATCH`/`DELETE`)
the client must echo it in the `x-csrf-token` header. Cookies are `SameSite=Strict`.

| Method | Path            | Auth        | CSRF | Description |
|--------|-----------------|-------------|------|-------------|
| GET    | `/health`       | none        | —    | Liveness check |
| POST   | `/auth/login`   | none        | —    | Email + password → sets `token` + `csrf_token` cookies |
| GET    | `/auth/me`      | cookie      | —    | Current user + permission map for the UI |
| POST   | `/auth/logout`  | cookie      | yes  | Clears session cookies |

### POST /auth/login

```json
// request
{ "email": "fleet@transitops.local", "password": "Passw0rd!" }
// response 200
{ "user": { "id": 1, "name": "Fleet Manager", "email": "...", "role": "FLEET_MANAGER", "isActive": true },
  "csrfToken": "…" }
```

Errors: `422` validation, `401` invalid credentials, `403` deactivated account.

### GET /auth/me

Returns the authenticated user plus the permission matrix for their role, so the client can
show/hide menus. Server still enforces every permission independently.

## Roles & permissions (enforced server-side)

Four roles (PDF Section 2): `FLEET_MANAGER`, `DRIVER` (dispatcher), `SAFETY_OFFICER`,
`FINANCIAL_ANALYST`. The authoritative permission matrix lives in
[`src/constants/permissions.js`](src/constants/permissions.js) and is applied via the
`authorize(module, action)` middleware.

## Module routes (added as each phase lands)

`/vehicles`, `/drivers`, `/trips`, `/maintenance`, `/fuel`, `/expenses`, `/reports` — each a
RESTful resource router guarded by `authenticate` + `authorize`.

## Demo logins (seeded, development only)

| Email                       | Password    | Role |
|-----------------------------|-------------|------|
| `fleet@transitops.local`    | `Passw0rd!` | Fleet Manager |
| `dispatch@transitops.local` | `Passw0rd!` | Driver (dispatcher) |
| `safety@transitops.local`   | `Passw0rd!` | Safety Officer |
| `finance@transitops.local`  | `Passw0rd!` | Financial Analyst |

Run `npm run seed` to (re)create them.
