---
name: nestjs-best-practices
description: NestJS expert best practices for writing, reviewing, or refactoring NestJS code. Triggers on tasks involving NestJS modules, controllers, services, DTOs, guards, interceptors, TypeORM entities, authentication, configuration, or performance patterns.
license: MIT
metadata:
  author: custom
  version: "1.0.0"
---

# NestJS Best Practices

Production-ready patterns and rules for building NestJS applications. Covers 14 categories across architecture, validation, auth, database, error handling, testing, and performance.

## When to Apply

Reference these guidelines when:
- Writing new NestJS modules, controllers, services, or DTOs
- Implementing authentication and authorization
- Setting up TypeORM entities and migrations
- Reviewing code for architecture or security issues
- Refactoring NestJS code for maintainability
- Building multi-tenant SaaS features
- Optimizing performance with caching, queues, or Fastify

## Rule Categories

| # | Category | Key Concern |
|---|----------|-------------|
| 1 | Project Structure | Domain-driven feature modules |
| 2 | Modules | Encapsulation, global providers |
| 3 | Controllers | HTTP-only, versioned routes, DTOs |
| 4 | Services | Business logic, typed exceptions |
| 5 | DTOs & Validation | class-validator, whitelist, transform |
| 6 | TypeORM / Database | Migrations, transactions, base entity |
| 7 | Auth & Authorization | JWT, global guard, roles, bcrypt |
| 8 | Configuration | @nestjs/config, Joi validation, no process.env |
| 9 | Error Handling | Global filter, normalized responses |
| 10 | Interceptors & Logging | Transform envelope, request ID |
| 11 | Testing | Unit + e2e, ≥80% coverage |
| 12 | Performance | Cache, BullMQ, Fastify, throttler |
| 13 | Multi-Tenancy | TenantContext, RLS, tenantId filter |
| 14 | Code Style | No any, explicit types, 300-line limit |

## Full Compiled Document

For all rules with code examples: `AGENTS.md`

## Individual Rule Files

```
rules/structure.md
rules/modules.md
rules/controllers.md
rules/services.md
rules/dto-validation.md
rules/typeorm.md
rules/auth.md
rules/config.md
rules/error-handling.md
rules/interceptors.md
rules/testing.md
rules/performance.md
rules/multi-tenancy.md
rules/code-style.md
```
