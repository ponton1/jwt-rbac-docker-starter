JWT RBAC Starter – Node.js / Express

A production-ready modular authentication API built with Node.js, Express and PostgreSQL.
Implements secure JWT authentication (access + refresh), refresh token rotation, immediate global revocation using tokenVersion, and Role-Based Access Control (RBAC).

Designed as a clean backend foundation ready for Docker, CI/CD, testing, and scalable production environments.

-----------------------------------------------------------------------------------------

PROJECT GOALS

Clean modular architecture (feature-based structure)

JWT access + refresh authentication flow

Secure refresh token rotation

Global session invalidation using tokenVersion

Role-Based Access Control (RBAC)

Centralized error handling

PostgreSQL persistence

Strict code quality enforcement (ESLint + Prettier + Husky)

-----------------------------------------------------------------------------------------

CURRENT IMPLEMENTATION

Authentication

JWT Access Token (short-lived, default 15m)

JWT Refresh Token (long-lived, default 7d)

Refresh token rotation with replaced_by

Refresh token hashing (SHA256) before DB storage

Token versioning for global revocation

Logout per session (single refresh token revocation)

Logout all sessions (tokenVersion increment + refresh revocation)

Authorization

requireAuth middleware (JWT validation + tokenVersion check)

requireRole(roles) RBAC middleware

Code Quality

ESLint

Prettier

Husky pre-commit hook

lint-staged (auto format + lint before commit)

Persistence Layer

PostgreSQL database

users table

refresh_tokens table

Hashed refresh tokens

Rotation tracking via replaced_by

Global revocation via token_version

-----------------------------------------------------------------------------------------

DATABASE SCHEMA
users

id (uuid)

email (unique)

password_hash

role

token_version

created_at

updated_at

refresh_tokens

id (uuid)

user_id (FK → users.id)

token_hash (SHA256)

expires_at

revoked_at

replaced_by (self reference)

created_at

-----------------------------------------------------------------------------------------

ARCHITECTURE OVERVIEW

src/
├── config/
│ ├── db.js
│ └── env.js
├── middlewares/
│ ├── auth.js
│ └── errorHandler.js
├── modules/
│ ├── auth/
│ │ ├── auth.controller.js
│ │ ├── auth.routes.js
│ │ ├── auth.service.js
│ │ └── auth.repository.js
│ └── users/
│ ├── users.controller.js
│ ├── users.routes.js
│ ├── users.service.js
│ └── users.repository.js
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

Architectural Principles:

Separation of concerns (routes → controller → service → repository)

Stateless JWT authentication

Refresh token rotation strategy

Immediate revocation via versioning

Repository abstraction ready for future extensions

Production-oriented structure

-----------------------------------------------------------------------------------------

AUTHENTICATION FLOW

User registers or logs in.

Access + Refresh tokens are issued.

Refresh token is hashed and stored in database.

Refresh rotation replaces old token and marks it revoked.

logout() revokes a single refresh token.

logoutAll() increments tokenVersion and revokes all refresh tokens.

Any access token with outdated tokenVersion becomes invalid immediately.

-----------------------------------------------------------------------------------------

AUTH ENDPOINTS

POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/logout-all

-----------------------------------------------------------------------------------------

RBAC ENDPOINTS

GET /users
GET /users/admin-only

Admin-only routes require role: admin.

-----------------------------------------------------------------------------------------

ENVIRONMENT VARIABLES

Create a .env file:

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

-----------------------------------------------------------------------------------------

LOCAL SETUP

Install dependencies:

npm install

Create environment file:

cp .env.example .env

Start server:

npm start

Server runs on:

http://localhost:3000

-----------------------------------------------------------------------------------------

SECURITY MODEL

Access Token:

Short-lived

Contains sub (user id), role, tokenVersion

Invalidated automatically if tokenVersion changes

Refresh Token:

Long-lived

Stored hashed (never stored in plain text)

Rotated on every refresh

Linked via replaced_by

Revoked on logout or logout-all

Global Logout:

Increments users.token_version

Invalidates all active access tokens

Revokes all refresh tokens for that user

-----------------------------------------------------------------------------------------

ROADMAP (NEXT PHASE)

Jest + Supertest integration tests

Docker + Docker Compose (API + PostgreSQL)

Redis option for refresh storage

GitHub Actions CI pipeline

Repository pattern improvements

Production logging (Pino)

Input validation (Zod / Joi)

-----------------------------------------------------------------------------------------

License

MIT
