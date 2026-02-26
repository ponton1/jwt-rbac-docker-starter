# JWT RBAC Docker Starter

Production-ready JWT auth starter (access + refresh tokens) with RBAC, built using Node.js, Express, PostgreSQL and Docker.

## Why this repo
This project showcases a clean and scalable API foundation:
- JWT authentication with refresh token flow
- Role-Based Access Control (RBAC)
- Centralized error handling
- Dockerized local environment (API + DB)
- CI-ready structure and conventions

## Tech Stack
- Node.js + Express
- PostgreSQL
- JWT (access + refresh)
- Docker + Docker Compose
- Jest (tests)
- ESLint + Prettier (code quality)

## Architecture (high level)
- `src/modules/*` feature-based modules (auth, users, etc.)
- `src/middlewares/*` auth, RBAC, error handler
- `src/config/*` env, db, constants
- `src/utils/*` helpers (tokens, hashing, etc.)

## API Scope (v1)
### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Users (protected)
- `GET /users/me`

### Admin (RBAC protected)
- `GET /admin/health`

## Quick Start (Docker)
```bash
# 1) Clone
git clone https://github.com/ponton1/jwt-rbac-docker-starter.git
cd jwt-rbac-docker-starter

# 2) Create env
cp .env.example .env

# 3) Run
docker compose up --build
