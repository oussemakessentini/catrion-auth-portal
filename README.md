# CATRION Auth Portal

A secure full-stack authentication and user management portal built as a take-home project for CATRION.

The application demonstrates modern authentication, authorization, role-based access control, REST API development, frontend session management, automated testing, and containerized deployment.

---

## Features

### Authentication

- User registration
- User login
- JWT access token authentication
- Refresh token support
- Automatic access token refresh
- Secure logout
- BCrypt password hashing
- Stateless authentication

### Authorization

- Role-based access control (RBAC)
- Permission-based authorization
- Protected user endpoints
- Protected administrator endpoints
- Method-level authorization with Spring Security
- Disabled-user access protection

### User Features

- View user profile
- Secure authenticated routes
- Persistent authentication session
- Automatic session restoration

### Administrator Features

- View registered users
- Enable users
- Disable users
- Administrator-only frontend routes
- Administrator-only backend endpoints

### Frontend

- Responsive authentication pages
- Dashboard layout
- Profile page
- Admin user management page
- Protected routes
- Admin routes
- Automatic JWT refresh
- CATRION-inspired corporate UI

### Testing

Backend integration tests cover:

- User registration
- User login
- Invalid credentials
- JWT-protected endpoints
- Unauthorized requests
- Role-based authorization
- Request validation
- Duplicate email registration

### Infrastructure

- Dockerized backend
- Dockerized frontend
- PostgreSQL container
- Nginx reverse proxy
- Docker Compose orchestration
- Environment-based configuration

---

# Tech Stack

## Backend

- Java 21
- Spring Boot 4
- Spring Security
- Spring Data JPA
- Hibernate
- JWT / JJWT
- PostgreSQL
- Maven
- Jakarta Validation
- JUnit
- MockMvc

## Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- CSS

## Infrastructure

- Docker
- Docker Compose
- Nginx
- PostgreSQL 16

---

# Architecture

The application uses a standard full-stack architecture:

```text
Browser
   |
   v
React + TypeScript
   |
   v
Nginx
   |
   | /api/*
   v
Spring Boot REST API
   |
   +--------------------+
   |                    |
Spring Security      Business Logic
   |                    |
   v                    v
JWT Authentication   Spring Data JPA
                        |
                        v
                    PostgreSQL
```

When running with Docker, the browser accesses the application through Nginx.

Frontend requests beginning with:

```text
/api/
```

are forwarded by Nginx to the Spring Boot backend.

---

# Project Structure

```text
catrion-auth-portal/
│
├── auth-portal/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   │
│   │   └── test/
│   │
│   ├── .mvn/
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── types/
│   │
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

# Authentication Flow

The application uses JWT-based stateless authentication.

## Login Flow

```text
User
 |
 | Email + Password
 v
POST /api/auth/login
 |
 v
Spring Security
 |
 | Credentials validated
 v
Access Token + Refresh Token
 |
 v
Frontend
```

The access token is sent with protected API requests:

```http
Authorization: Bearer <access-token>
```

---

# Refresh Token Flow

Access tokens have a shorter lifetime than refresh tokens.

When an access token expires:

```text
API Request
    |
    v
401 Unauthorized
    |
    v
Axios Interceptor
    |
    v
POST /api/auth/refresh
    |
    v
New Access Token
    |
    v
Retry Original Request
```

This allows the user to remain authenticated without manually logging in again while the refresh token remains valid.

---

# Roles and Permissions

The application contains two main roles.

## ROLE_USER

Permissions:

```text
PROFILE_READ
PROFILE_UPDATE
```

A normal user can access their own profile and authenticated user functionality.

## ROLE_ADMIN

Permissions:

```text
PROFILE_READ
PROFILE_UPDATE
USER_READ
USER_CREATE
USER_UPDATE
USER_DISABLE
```

Administrators can access user management functionality.

Backend authorization remains authoritative even if frontend routes or UI elements are hidden.

---

# API Endpoints

## Authentication

### Register

```http
POST /api/auth/register
```

Example request:

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

---

### Login

```http
POST /api/auth/login
```

Example request:

```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

Example response:

```json
{
  "accessToken": "<access-token>",
  "refreshToken": "<refresh-token>",
  "tokenType": "Bearer",
  "email": "john@example.com",
  "fullName": "John Doe",
  "roles": [
    "ROLE_USER"
  ]
}
```

---

### Refresh Token

```http
POST /api/auth/refresh
```

Example request:

```json
{
  "refreshToken": "<refresh-token>"
}
```

---

### Logout

```http
POST /api/auth/logout
```

Requires authentication.

---

# User Endpoints

### Get Profile

```http
GET /api/user/profile
```

Requires a valid JWT.

---

### Secure Profile

```http
GET /api/user/secure-profile
```

Requires:

```text
PROFILE_READ
```

permission.

---

# Administrator Endpoints

### Get Users

```http
GET /api/admin/users
```

Requires:

```text
USER_READ
```

permission.

---

### Enable or Disable User

```http
PATCH /api/admin/users/{id}/status?enabled=false
```

or:

```http
PATCH /api/admin/users/{id}/status?enabled=true
```

Requires:

```text
USER_DISABLE
```

permission.

---

# Security

The application implements multiple security mechanisms.

## Password Security

Passwords are never stored as plain text.

Passwords are hashed using:

```text
BCrypt
```

before being persisted.

## JWT Authentication

Protected API requests require a valid JWT access token.

The backend validates:

- Token signature
- Token expiration
- User identity
- User enabled status

## Stateless Sessions

Spring Security uses:

```text
SessionCreationPolicy.STATELESS
```

The backend does not maintain traditional server-side HTTP sessions.

## Role and Permission Authorization

Spring Security method authorization is enabled.

Protected operations use authorization rules such as:

```java
@PreAuthorize("hasAuthority('USER_READ')")
```

## HTTP Status Handling

The API distinguishes between:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
500 Internal Server Error
```

For example:

- Missing or invalid authentication → `401`
- Authenticated user without required permission → `403`

---

# Environment Configuration

Sensitive configuration is provided through environment variables.

Create a `.env` file in the project root.

Example:

```env
POSTGRES_DB=catrion_auth
POSTGRES_USER=catrion_user
POSTGRES_PASSWORD=change_me

JWT_SECRET=replace_with_secure_base64_secret

ADMIN_EMAIL=admin@catrion.local
ADMIN_PASSWORD=change_me
ADMIN_FULL_NAME=CATRION Administrator
```

The `.env` file must **not** be committed to source control.

---

# Backend Configuration

The backend supports environment-based configuration.

Example:

```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5435/catrion_auth}
spring.datasource.username=${DB_USERNAME:catrion_user}
spring.datasource.password=${DB_PASSWORD}

server.port=${SERVER_PORT:8080}

app.jwt.secret=${JWT_SECRET}
app.jwt.expiration=${JWT_EXPIRATION:900000}
app.jwt.refresh-expiration=${JWT_REFRESH_EXPIRATION:604800000}

app.admin.email=${ADMIN_EMAIL:admin@catrion.local}
app.admin.password=${ADMIN_PASSWORD}
app.admin.full-name=${ADMIN_FULL_NAME:CATRION Administrator}

app.cors.allowed-origin=${CORS_ALLOWED_ORIGIN:http://localhost:5173}
```

---

# Running With Docker

Docker is the recommended way to run the complete application.

## Prerequisites

Install:

- Docker
- Docker Compose

Verify Docker:

```bash
docker --version
docker compose version
```

---

## Build the Application

From the project root:

```bash
docker compose build
```

---

## Start the Application

```bash
docker compose up
```

Or run in the background:

```bash
docker compose up -d
```

---

## Access the Application

Open:

```text
http://localhost:3000
```

The architecture when running through Docker is:

```text
localhost:3000
      |
      v
    Nginx
    /    \
   /      \
React    /api/*
           |
           v
      Spring Boot
           |
           v
       PostgreSQL
```

---

# Docker Services

Docker Compose starts three main services.

## PostgreSQL

```text
database
```

Stores:

- Users
- Roles
- Permissions
- Refresh tokens

## Backend

```text
backend
```

Runs the Spring Boot application on port `8080` inside the Docker network.

## Frontend

```text
frontend
```

Runs the React production build through Nginx.

The frontend is exposed locally on:

```text
localhost:3000
```

---

# Stop the Application

Stop the containers:

```bash
docker compose down
```

---

# Reset the Database

To stop the application and delete the PostgreSQL Docker volume:

```bash
docker compose down -v
```

Then start again:

```bash
docker compose up --build
```

> Warning: deleting the volume removes persisted application data.

---

# Running Backend Tests

The backend contains integration tests using Spring Boot and MockMvc.

From:

```text
auth-portal/
```

Linux/macOS:

```bash
./mvnw test
```

Windows:

```powershell
.\mvnw.cmd test
```

---

# Integration Test Coverage

The authentication integration test suite verifies:

```text
✓ User registration
✓ User login
✓ Invalid credentials rejected
✓ Profile accessible with valid JWT
✓ Profile rejected without JWT
✓ Normal user rejected from admin API
✓ Invalid registration rejected
✓ Duplicate email rejected
```

Tests generate unique email addresses so they can be executed repeatedly without conflicting with existing PostgreSQL data.

---

# Frontend Development

To run the frontend separately during development:

```bash
cd frontend
npm install
npm run dev
```

Vite will start the development server.

By default:

```text
http://localhost:5173
```

---

# Frontend Production Build

```bash
cd frontend
npm run build
```

The production files are generated inside:

```text
frontend/dist/
```

---

# Backend Development

To run the backend separately:

```bash
cd auth-portal
```

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
./mvnw spring-boot:run
```

The backend runs by default on:

```text
http://localhost:8080
```

A PostgreSQL database must be available when running the backend outside Docker.

---

# Default Administrator

An administrator account is automatically initialized using environment variables.

```text
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_FULL_NAME
```

For security reasons, administrator credentials should never be hardcoded into source control.

---

# CORS

For local frontend development, the backend allows the configured frontend origin.

Default:

```text
http://localhost:5173
```

When running through Docker/Nginx, API traffic is proxied through the frontend server.

---

# Error Handling

The backend provides centralized API error handling.

Example:

```json
{
  "timestamp": "2026-09-12T15:55:08Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Email is already registered",
  "path": "/api/auth/register",
  "validationErrors": null
}
```

Validation errors can also contain field-level error information.

---

# Design Decisions

## Why JWT?

JWT was selected because the backend is designed as a stateless REST API.

It provides:

- Stateless authentication
- Easy API authorization
- Scalability
- Clear frontend/backend separation

## Why Refresh Tokens?

Access tokens can remain short-lived while refresh tokens provide longer authenticated sessions.

This reduces the impact of an expired access token without requiring the user to log in repeatedly.

## Why RBAC?

Role-based access control provides clear separation between normal users and administrators.

Permissions provide additional flexibility beyond checking only role names.

## Why PostgreSQL?

PostgreSQL provides reliable relational persistence for users, roles, permissions, and authentication-related data.

## Why Docker?

Docker provides a consistent environment for reviewers and developers.

The complete application can be started using:

```bash
docker compose up
```

without manually configuring each service.

## Why Nginx?

Nginx serves the React production build and acts as a reverse proxy between the frontend and backend.

This allows frontend API calls to use:

```text
/api
```

instead of hardcoding a backend hostname.

---

# Future Improvements

Possible production enhancements include:

- Flyway database migrations
- Email verification
- Forgot-password flow
- Password reset
- Account lockout after repeated failed attempts
- Rate limiting
- Audit logging
- OAuth 2.0 / OpenID Connect
- HttpOnly cookie-based token strategy
- Testcontainers
- CI/CD pipeline
- Cloud deployment
- Monitoring and observability

---

# Final Notes

This project focuses on demonstrating:

- Full-stack application development
- REST API design
- Spring Security
- JWT authentication
- Refresh token management
- RBAC and permissions
- React authentication flows
- TypeScript
- PostgreSQL persistence
- Integration testing
- Docker containerization
- Nginx reverse proxy configuration
- Secure configuration practices

The application can be built and started with:

```bash
docker compose build
docker compose up
```

Then access:

```text
http://localhost:3000
```

---

## Author

**Oussama Ksantini**

Senior Full Stack Software Engineer