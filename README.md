JWT RBAC Starter – Node.js / Express

A modular and scalable authentication API starter featuring JWT
(access + refresh), refresh token rotation, immediate revocation via
tokenVersion, and Role-Based Access Control (RBAC).

Designed as a clean backend foundation ready to evolve toward
PostgreSQL, Redis, Docker and CI/CD.

------------------------------------------------------------------------

PROJECT GOALS

-   Clean modular architecture (feature-based structure)
-   JWT access + refresh flow
-   Refresh token rotation
-   Global session invalidation using tokenVersion
-   Role-Based Access Control (RBAC)
-   Centralized error handling
-   Strict code quality enforcement (ESLint + Prettier + Husky)

------------------------------------------------------------------------

CURRENT IMPLEMENTATION

Authentication: - JWT Access Token - JWT Refresh Token - Refresh
rotation - Token versioning for global revocation - Logout per session -
Logout all sessions

Authorization: - requireAuth middleware - authorize(roles) RBAC
middleware

Code Quality: - ESLint - Prettier - Husky pre-commit hook - lint-staged
(auto format + lint before commit)

Current persistence layer uses in-memory stores for development
simplicity.

------------------------------------------------------------------------

ARCHITECTURE OVERVIEW

src/
├── config/
│   └── env.js
├── middlewares/
│   ├── auth.js
│   └── errorHandler.js
├── modules/
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.routes.js
│   │   └── auth.service.js
│   └── users/
│       ├── users.controller.js
│       ├── users.routes.js
│       └── users.service.js
├── app.js
└── server.js

Root:
.editorconfig
.env
.env.example
eslint.config.js
.prettierrc.json
.prettierignore
.husky/
package.json
README.md

Architectural Principles: - Separation of concerns (routes → controller
→ service) - Stateless JWT authentication - Revocation strategy using
versioning - Ready for repository layer abstraction (future DB
migration)

------------------------------------------------------------------------

AUTHENTICATION FLOW

Register: POST /auth/register

Login: POST /auth/login Returns accessToken and refreshToken

Refresh: POST /auth/refresh Generates new access + refresh tokens and
invalidates old refresh token

Logout: POST /auth/logout

Logout All: POST /auth/logout-all

------------------------------------------------------------------------

RBAC ENDPOINTS

GET /users GET /users/admin-only

Admin-only routes require role: admin

------------------------------------------------------------------------

LOCAL SETUP

npm install cp .env.example .env npm start

Server runs on: http://localhost:3000

------------------------------------------------------------------------

ROADMAP (PLANNED EXTENSIONS)

-   PostgreSQL persistence layer
-   Redis for refresh token storage
-   Docker + Docker Compose (API + DB)
-   Jest + Supertest integration tests
-   GitHub Actions CI pipeline
-   Repository pattern abstraction
-   Production logging (Pino)

These features will be added incrementally while preserving the modular
architecture.

------------------------------------------------------------------------

License MIT
