# JWT RBAC Starter

## Enterprise-Grade Authentication API -- Node.js / Express / PostgreSQL

[![CI](https://github.com/ponton1/jwt-rbac-docker-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/ponton1/jwt-rbac-docker-starter/actions/workflows/ci.yml)

---

## Executive Summary

JWT RBAC Starter is a production-oriented authentication API built with
Node.js, Express, and PostgreSQL.

It implements secure JWT authentication with access and refresh tokens,
refresh token rotation (replay protection), immediate global revocation
via tokenVersion, and Role-Based Access Control (RBAC).

The project is designed as a clean, modular backend foundation aligned
with enterprise engineering standards, including CI integration,
automated testing, Dockerized environments, and separation-of-concerns
architecture.

---

## Core Capabilities

### Authentication

- Short-lived JWT Access Tokens
- Long-lived JWT Refresh Tokens
- Refresh token rotation with replay protection
- SHA256 hashing of refresh tokens before persistence
- Global session invalidation using tokenVersion
- Single-session logout
- Multi-session global logout

### Authorization

- `requireAuth` middleware (JWT validation + tokenVersion
  verification)
- `requireRole(roles)` middleware for RBAC enforcement

### Persistence

- PostgreSQL as primary data store
- Token rotation tracking using `replaced_by`
- Immediate revocation support
- Referential integrity with foreign keys

### Quality & Governance

- Integration testing with Jest + Supertest
- Dedicated isolated test database (`.env.test`)
- Coverage thresholds enforced in CI
- ESLint + Prettier for code consistency
- Deterministic builds using `npm ci`

---

## Architecture Overview

```text
src/
├── config/
│   ├── db.js
│   └── env.js
├── middlewares/
│   ├── auth.js
│   └── errorHandler.js
├── modules/
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.routes.js
│   │   ├── auth.service.js
│   │   └── auth.repository.js
│   └── users/
│       ├── users.controller.js
│       ├── users.routes.js
│       ├── users.service.js
│       └── users.repository.js
├── app.js
└── server.js
```

### Architectural Principles

- Strict separation of concerns (route → controller → service →
  repository)
- Stateless JWT-based authentication
- Token rotation strategy for replay mitigation
- Version-based global revocation
- Repository abstraction for database portability
- Production-oriented modular design

---

## Database Schema

### users

- id (uuid)
- email (unique)
- password_hash
- role
- token_version
- created_at
- updated_at

### refresh_tokens

- id (uuid)
- user_id (FK → users.id)
- token_hash (unique, SHA256)
- expires_at
- revoked_at
- replaced_by (self reference)
- created_at

---

## Authentication Flow

1.  User registers or logs in.
2.  Access + Refresh tokens are issued.
3.  Refresh token is hashed and stored.
4.  Refresh requests rotate tokens (old token revoked).
5.  logout() revokes single refresh token.
6.  logoutAll() increments tokenVersion and revokes all sessions.
7.  Access tokens with outdated tokenVersion are invalid immediately.

---

## API Endpoints

### Auth

- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- POST /auth/logout-all

### RBAC

- GET /users
- GET /users/admin-only

Admin routes require role: `admin`.

---

## Docker Deployment

### Development

```bash
docker compose up --build
```

Health checks: - http://localhost:3000/health -
http://localhost:3000/db-health

Stop:

```bash
docker compose down
```

Reset DB:

```bash
docker compose down -v
```

---

### Production

```bash
docker compose -f docker-compose.prod.yml up --build
```

Production image: - Installs production dependencies only - Uses
deterministic install (`npm ci --omit=dev --ignore-scripts`) - Optimized
runtime environment

---

## Continuous Integration

On every push or pull request:

- Clean Node environment provisioned
- PostgreSQL service container started
- Dependencies installed using `npm ci`
- Full integration test suite executed
- Coverage thresholds validated

Ensures: - Deterministic builds - Automated regression prevention -
Environment consistency - Database-backed testing reliability

---

## Environment Configuration

### Development (.env)

PORT=3000

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

DB_HOST=db DB_PORT=5432 DB_NAME=jwt_rbac_db DB_USER=postgres
DB_PASSWORD=postgres

### Testing (.env.test)

Isolated database configuration recommended (jwt_rbac_test).

---

## Security Model

### Access Token

- Short-lived
- Contains sub, role, tokenVersion
- Invalidated if tokenVersion changes

### Refresh Token

- Long-lived
- Stored hashed (never plain text)
- Rotated on every refresh
- Linked via replaced_by
- Revoked on logout or global logout

### Global Revocation Strategy

- tokenVersion increment
- Immediate invalidation of all active sessions
- All refresh tokens revoked

---

## Production Readiness

This project is designed as a backend foundation suitable for:

- SaaS authentication services
- Enterprise internal platforms
- Modular microservice ecosystems
- CI-driven engineering environments
- Cloud container deployment (Render, Fly.io, AWS ECS, etc.)

---

## License

MIT
