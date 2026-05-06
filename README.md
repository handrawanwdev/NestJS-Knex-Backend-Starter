# Modular Backend Starter

A structured, scalable, and opinionated backend starter built with **NestJS + KnexJS + PostgreSQL**, designed to enforce clean architecture, consistent patterns, and production-ready standards.

---

## 🚀 Overview

**Modular Backend Starter** is a backend template that helps developers build applications with:

* Clear separation of concerns (Controller → Service → Repository)
* Consistent database structure and naming
* Scalable modular architecture
* Production-ready patterns (auth, role, permission, queue, cache)
* Strict development guidelines to prevent messy code

This template is **opinionated by design** — it enforces best practices to maintain long-term maintainability and scalability.

---

## 🧱 Tech Stack

* **Framework**: NestJS
* **Database**: PostgreSQL
* **Query Builder**: KnexJS
* **Cache & Queue**: Redis
* **Architecture**: Modular Monolith
* **Language**: TypeScript

---

## 📁 Project Structure

```
src/
├── app.module.ts
├── main.ts
├── config/
├── database/
├── common/
├── modules/
└── shared/

database/
├── knexfile.ts
├── migrations/
└── seeds/
```

### Key Concepts

* `modules/` → All business domains
* `repositories/` → Database access (Knex only)
* `services/` → Business logic
* `controllers/` → HTTP layer
* `database/` → Migration & seed management

---

## 🧠 Architecture Pattern

Every feature must follow:

```
Controller → Service → Repository → Database
```

### Rules:

* Controller: handle HTTP only
* Service: business logic
* Repository: database query only
* DTO: validation only

---

## 🗄️ Database Standards

### Table Naming

```
{domain}_{entity}
```

Example:

```
auth_user
auth_role
village
booking
```

### Column Naming

* Use `snake_case`
* Required fields:

  * `id` (primary key)
  * `uuid` (public identifier)
  * `created_at`
  * `updated_at`

### UUID vs ID

* `id` → internal (number, primary key)
* `uuid` → public (used in API)

---

## 🔐 Authentication & Authorization

### Roles

* `super_admin`
* `admin`
* `staff`

### Permission Format

```
{module}:{action}
```

Example:

```
user:create
user:read
village:update
```

---

## 🔄 Migration & Seed

### Migration

Location:

```
database/migrations/
```

Rules:

* Always include `up` and `down`
* Never modify existing migration
* Use snake_case naming

### Seed

Location:

```
database/seeds/
```

Used for:

* Roles
* Permissions
* Initial system data

---

## ⚡ Redis Usage

Used for:

* Cache
* Lock
* Queue
* Rate limiting

### Key Format

```
app:{feature}:{identifier}
```

Example:

```
app:cache:user:1
app:lock:register
```

---

## 🧵 Queue & Worker

Use background jobs for:

* Heavy processing
* Reports
* Import/export
* Cleanup tasks

Rules:

* Do not block HTTP request
* Jobs must be idempotent
* Always log failures

---

## 📦 Module Structure

```
modules/{module-name}/
├── controllers/
├── services/
├── repositories/
├── dto/
├── constants/
├── enums/
├── types/
└── mappers/
```

---

## 📡 API Response Standard

### Success

```json
{
  "status": 200,
  "message": "Success",
  "data": {}
}
```

### Error

```json
{
  "status": 400,
  "message": "Bad Request",
  "data": null,
  "error": "Validation error"
}
```

---

## 🔒 Security Guidelines

* Always hash passwords
* Never expose sensitive data
* Use environment variables for secrets
* Protect routes with roles/permissions
* Prevent SQL injection via query builder

---

## 🛠️ Development Rules

### Do

* Use repository for all DB queries
* Use service for business logic
* Use DTO for validation
* Follow naming conventions strictly

### Don't

* Write queries in controller
* Mix business logic in repository
* Use camelCase in database
* Expose internal IDs publicly
* Hardcode secrets

---

## 🧪 Getting Started

### 1. Install Dependencies

```
npm install
```

### 2. Setup Environment

Copy `.env.example`:

```
cp .env.example .env
```

Update configuration as needed.

### 3. Run Migration

```
npm run migrate
```

### 4. Run Seed

```
npm run seed
```

### 5. Start Development Server

```
npm run start:dev
```

---

## 📈 Scalability

This project uses **modular monolith architecture** by default.

It can be upgraded into microservices if needed:

```
apps/
libs/
```

---

## 🎯 Goal

This template exists to:

* Prevent messy backend structure
* Enforce consistency across teams
* Accelerate development with best practices
* Provide a solid foundation for scalable systems

---

## 📌 Philosophy

> Structure over speed.
> Consistency over creativity.
> Discipline over shortcuts.

---

## 🧩 Future Improvements

* CLI generator for modules
* Built-in auth module
* Logging & monitoring integration
* Testing setup (unit & e2e)
* Docker & CI/CD pipeline

---

## 📄 License

MIT License
