# JWT RBAC Starter – Node.js / Express

![CI](https://github.com/ponton1/jwt-rbac-docker-starter/actions/workflows/ci.yml/badge.svg)

A production-ready, modular authentication API built with Node.js, Express, and
PostgreSQL.

Implements secure JWT authentication (access + refresh), refresh token rotation,
immediate global revocation using tokenVersion, and Role-Based Access Control
(RBAC).

Designed as a clean backend foundation ready for CI, automated testing, and
scalable production environments.

---

## Project Goals

- Clean modular architecture (feature-based structure)
- JWT access + refresh authentication flow
- Secure refresh token rotation (replay protection)
- Global session invalidation using tokenVersion
- Role-Based Access Control (RBAC)
- Centralized error handling
- PostgreSQL persistence
- Code quality enforcement (ESLint + Prettier)

---

---

## Continuous Integration (CI)

This project includes an automated GitHub Actions pipeline.

On every push to main:

- A clean Node.js environment is created
- PostgreSQL service container is started
- Dependencies are installed using npm ci
- Full integration test suite runs
- Coverage thresholds are validated

This guarantees:

- Deterministic builds
- Database-backed integration testing
- Automatic failure detection
- Code quality enforcement

---

## Current Implementation

Authentication

- JWT Access Token (short-lived, default 15m)
- JWT Refresh Token (long-lived, default 7d)
- Refresh token rotation with replaced_by tracking
- Refresh token hashing (SHA256) before DB storage (never store plain token)
- Token versioning for global revocation (tokenVersion)
- Logout per session (single refresh token revocation)
- Logout all sessions (tokenVersion increment + refresh revocation)

Authorization

- requireAuth middleware (JWT validation + tokenVersion check)
- requireRole(roles) RBAC middleware

Persistence Layer

- PostgreSQL database
- users table
- refresh_tokens table
- Rotation tracking via replaced_by
- Global revocation via users.token_version

Testing & Quality Gates

- Integration tests with Jest + Supertest
- Dedicated test database via .env.test (isolated from dev DB)
- Coverage report via `npm run test:coverage`
- Coverage thresholds to prevent regressions (configured in jest.config.js)

---

## Database Schema

users

- id (uuid)
- email (unique)
- password_hash
- role
- token_version
- created_at
- updated_at

refresh_tokens

- id (uuid)
- user_id (FK → users.id)
- token_hash (SHA256, unique)
- expires_at
- revoked_at
- replaced_by (self reference)
- created_at

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

Architectural Principles

- Separation of concerns (routes → controller → service → repository)
- Stateless JWT authentication
- Refresh token rotation strategy (replay protection)
- Immediate revocation via versioning (tokenVersion)
- Repository abstraction ready for future extensions
- Production-oriented structure

---

## Authentication Flow

1. User registers or logs in.
2. Access + Refresh tokens are issued.
3. Refresh token is hashed and stored in the database.
4. Refresh rotation replaces the old token and marks it revoked.
5. logout() revokes a single refresh token.
6. logoutAll() increments tokenVersion and revokes all refresh tokens.
7. Any access token with an outdated tokenVersion becomes invalid immediately.

---

## API Endpoints

Auth

- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- POST /auth/logout-all (requires Authorization: Bearer <accessToken>)

RBAC / Users

- GET /users (protected)
- GET /users/admin-only (protected + admin role)

Admin-only routes require role: admin.

---

## Environment Variables

Development: create a .env file (do NOT commit secrets)

PORT=3000
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

DB_HOST=localhost
DB_PORT=5432
DB_NAME=jwt_rbac_db
DB_USER=your_user
DB_PASSWORD=your_password

Testing: create a .env.test file (isolated DB)

DB_HOST=localhost
DB_PORT=5432
DB_NAME=jwt_rbac_test
DB_USER=your_user
DB_PASSWORD=your_password

JWT_ACCESS_SECRET=test_access_secret
JWT_REFRESH_SECRET=test_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

---

## Local Setup

1. Install dependencies
   npm install

2. Create environment file
   cp .env.example .env

3. Start server
   npm start

Server runs on:
http://localhost:3000

---

## Testing

Run all tests:
npm test

Run coverage:
npm run test:coverage

Notes:

- Tests run against the DB defined in .env.test (recommended: jwt_rbac_test).
- Coverage thresholds are enforced to prevent regressions.

---

## Security Model

Access Token

- Short-lived
- Contains sub (user id), role, tokenVersion
- Invalidated automatically if tokenVersion changes

Refresh Token

- Long-lived
- Stored hashed (never stored in plain text)
- Rotated on every refresh (old token becomes invalid)
- Linked via replaced_by
- Revoked on logout or logout-all

Global Logout

- Increments users.token_version
- Invalidates all active access tokens
- Revokes all refresh tokens for that user

---

## Roadmap (Optional Next Steps)

- GitHub Actions CI pipeline (run `npm test` on push/PR)
- Docker + Docker Compose (API + PostgreSQL)
- Input validation layer (Zod / Joi)
- Production logging (Pino)
- Rate limiting + security headers (helmet)
- Redis option for refresh storage (if needed)

---

## License

MIT
```
