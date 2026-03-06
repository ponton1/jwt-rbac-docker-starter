# JWT RBAC Starter

## Enterprise-Grade Authentication API — Node.js / Express / PostgreSQL

![Node](https://img.shields.io/badge/node.js-18+-green)
![Express](https://img.shields.io/badge/express-framework-lightgrey)
![PostgreSQL](https://img.shields.io/badge/postgresql-database-blue)
![Docker](https://img.shields.io/badge/docker-container-blue)
![CI](https://github.com/ponton1/jwt-rbac-docker-starter/actions/workflows/ci.yml/badge.svg)

---

# Live API

Production demo deployed in the cloud.

Health endpoint:

https://jwt-rbac-docker-starter.onrender.com/health

Database connectivity test:

https://jwt-rbac-docker-starter.onrender.com/db-health

---

# Executive Summary

JWT RBAC Starter is a production‑oriented authentication API built with
Node.js, Express and PostgreSQL.

It implements secure authentication using:

• Access Tokens
• Refresh Tokens
• Refresh Token Rotation
• Global session revocation via tokenVersion
• Role Based Access Control (RBAC)

The project follows clean backend architecture principles and includes:

• Docker environment
• CI pipeline
• Automated integration tests
• Secure token management
• Modular architecture

This repository is designed to be a **clean backend foundation for SaaS
applications and microservices**.

---

# Core Capabilities

## Authentication

• Short‑lived JWT Access Tokens
• Long‑lived JWT Refresh Tokens
• Refresh Token Rotation (Replay Protection)
• SHA256 hashing of refresh tokens before database storage
• Global session invalidation via tokenVersion
• Single session logout
• Global logout across all sessions

---

## Authorization

Middleware based authorization:

requireAuth → validates JWT and tokenVersion

requireRole(roles) → enforces RBAC

Example:

Admin routes require role: admin

---

## Persistence Layer

Primary database: PostgreSQL

Features:

• Refresh token rotation tracking via replaced_by
• Immediate revocation support
• Referential integrity via foreign keys
• UUID primary keys

---

## Quality & Governance

• Integration tests using Jest + Supertest
• Dedicated isolated test database (.env.test)
• Coverage thresholds enforced in CI
• ESLint + Prettier for consistent code style
• Deterministic builds using npm ci

---

# Architecture Overview

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

---

## System Design

This API follows a layered architecture to ensure clear separation of
responsibilities and maintainability.

```text
Client
   │
   ▼
HTTP Requests
   │
   ▼
Express Routes
   │
   ▼
Controllers
   │
   ▼
Services (Business Logic)
   │
   ▼
Repositories (Data Access Layer)
   │
   ▼
PostgreSQL Database
```

---

### Layer Responsibilities

Routes
Define API endpoints and map them to controllers.

Controllers
Handle HTTP request/response and delegate business logic.

Services
Contain core application logic such as authentication flows,
token rotation, and authorization decisions.

Repositories
Interact with the database and encapsulate SQL queries.

Database
PostgreSQL used for persistence, enforcing referential integrity
and transactional consistency.

---

# Architectural Principles

• Strict separation of concerns

route → controller → service → repository

• Stateless JWT authentication

• Token rotation strategy for replay attack mitigation

• Version‑based global session revocation

• Repository abstraction layer for database portability

• Modular scalable backend design

---

# High Level Architecture

```text
Client
   │
   ▼
Express Routes
   │
   ▼
Controllers
   │
   ▼
Services (Business Logic)
   │
   ▼
Repositories
   │
   ▼
PostgreSQL Database
```

---

# Database Schema

## users

id (uuid)
email (unique)
password_hash
role
token_version
created_at
updated_at

---

## refresh_tokens

id (uuid)
user_id (FK → users.id)
token_hash (SHA256)
expires_at
revoked_at
replaced_by
created_at

---

# Authentication Flow

1 User registers or logs in

2 Access Token + Refresh Token issued

3 Refresh token hashed and stored in database

4 Client uses access token for API calls

5 When access token expires:

Client sends refresh token

6 Server rotates refresh token

Old refresh token revoked

New refresh token issued

7 logout() revokes current session

8 logoutAll() increments tokenVersion and revokes all sessions

Access tokens with outdated tokenVersion become invalid immediately

---

# API Endpoints

## Auth

POST /auth/register

POST /auth/login

POST /auth/refresh

POST /auth/logout

POST /auth/logout-all

---

## Users

GET /users

GET /users/admin-only

Admin routes require role: admin

---

# Example API Usage

Register user:

curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"user@test.com","password":"123456"}'

---

Login:

curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"user@test.com","password":"123456"}'

---

# Docker Deployment

## Development

docker compose up --build

Health checks:

http://localhost:3000/health

http://localhost:3000/db-health

Stop:

docker compose down

Reset database:

docker compose down -v

---

## Production

docker compose -f docker-compose.prod.yml up --build

Production container:

• Installs production dependencies only
• Uses deterministic install (npm ci --omit=dev --ignore-scripts)
• Optimized runtime environment

---

# Continuous Integration

On every push or pull request:

1 Clean Node environment created

2 PostgreSQL container started

3 Dependencies installed using npm ci

4 Integration tests executed

5 Coverage thresholds validated

CI ensures:

• Deterministic builds
• Automated regression prevention
• Environment consistency
• Database backed testing

---

# Environment Configuration

## Development (.env)

PORT=3000

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

DB_HOST=db
DB_PORT=5432
DB_NAME=jwt_rbac_db
DB_USER=postgres
DB_PASSWORD=postgres

---

## Testing (.env.test)

Separate database recommended:

jwt_rbac_test

---

# Security Model

## Access Token

• Short lived
• Contains user id, role and tokenVersion
• Invalidated when tokenVersion changes

---

## Refresh Token

• Long lived
• Stored hashed (never plaintext)
• Rotated on every refresh request
• Linked via replaced_by

---

## Global Revocation Strategy

tokenVersion increment

All refresh tokens revoked

All access tokens become invalid immediately

---

# Production Readiness

This project is suitable as a backend foundation for:

• SaaS authentication services
• Enterprise internal platforms
• Microservice architectures
• CI driven engineering environments
• Cloud container deployments

Compatible platforms:

Render
Fly.io
AWS ECS
Digital Ocean
Railway

---

# License

MIT
