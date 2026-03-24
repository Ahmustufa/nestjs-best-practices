# nestjs-best-practices-skill — NestJS Best Practices for Claude Code, Cursor & Windsurf

[![npm version](https://img.shields.io/npm/v/nestjs-best-practices-skill.svg)](https://www.npmjs.com/package/nestjs-best-practices-skill)
[![npm downloads](https://img.shields.io/npm/dm/nestjs-best-practices-skill.svg)](https://www.npmjs.com/package/nestjs-best-practices-skill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blue)](https://claude.ai/code)
[![Cursor](https://img.shields.io/badge/Cursor-Compatible-purple)](https://cursor.sh)
[![Windsurf](https://img.shields.io/badge/Windsurf-Compatible-teal)](https://codeium.com/windsurf)
[![NestJS](https://img.shields.io/badge/NestJS-v10%2B-red)](https://nestjs.com)

`nestjs-best-practices-skill` is an AI coding assistant skill that turns **Claude Code**, **Cursor**, and **Windsurf** into a senior NestJS architect. Install it once and your AI assistant automatically enforces 24 production-ready rules every time you write, review, or refactor NestJS code — covering architecture, authentication, TypeORM, validation, security hardening, testing, multi-tenancy, and more.

No more AI-generated NestJS boilerplate that compiles but ignores production concerns. This skill enforces the patterns a senior engineer would catch in code review.

## Quick Install

```bash
npx nestjs-best-practices-skill
```

The interactive installer guides you through two steps with arrow-key navigation:

**Step 1 — Pick your editor:**
```
  ╔═══════════════════════════════════════════════════╗
  ║  ⚡ NestJS Best Practices  Skill Installer        ║
  ║  24 production-ready rules for your AI editor     ║
  ╚═══════════════════════════════════════════════════╝

  Select your AI code editor:

  ▶ ◆  Claude Code            ← highlighted, move with ↑ ↓
      ⬡  Cursor
      ◈  Windsurf
      ★  All supported tools
      …  Custom path

  ↑/↓ navigate  ⏎ select
```

**Step 2 — Pick install scope:**
```
  Install scope:

  ▶ 🌐  Global (available in all projects)
      📁  Local (current project only)

  ↑/↓ navigate  ⏎ select
```

**Done:**
```
  ✓ Installed for Claude Code → ~/.claude/skills/nestjs-best-practices

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Installation complete!
  Restart your editor to activate the skill.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Compatible AI Editors

| Editor | Install Path |
|--------|-------------|
| [Claude Code](https://claude.ai/code) | `~/.claude/skills/nestjs-best-practices` |
| [Cursor](https://cursor.sh) | `~/.cursor/skills/nestjs-best-practices` |
| [Windsurf](https://codeium.com/windsurf) | `~/.windsurf/skills/nestjs-best-practices` |
| Custom | Any path you specify |

Works with NestJS v10 and v11.

## What This Skill Enforces

24 production-ready categories — each with a dedicated rule file and code examples:

| # | Category | Priority | What It Enforces |
|---|----------|----------|-----------------|
| 1 | Project Structure | CRITICAL | Domain-driven feature modules, no flat `src/` |
| 2 | Modules | CRITICAL | Encapsulation, `@Global()` restraint, dynamic modules |
| 3 | Middleware | HIGH | Execution order, functional vs class-based |
| 4 | Controllers | CRITICAL | HTTP-only, versioned routes, DTO responses, no `@Res()` |
| 5 | Services | CRITICAL | Business logic isolation, typed exceptions, async/await |
| 6 | Custom Providers | HIGH | useClass/useValue/useFactory, injection scopes, `forwardRef` |
| 7 | Custom Decorators | MEDIUM | `createParamDecorator`, `applyDecorators` composition |
| 8 | DTOs & Validation | CRITICAL | class-validator, class-transformer, whitelist, `@Exclude()` |
| 9 | TypeORM / Database | CRITICAL | Migrations only, transactions, base entity, `autoLoadEntities` |
| 10 | Auth & Authorization | CRITICAL | JWT global guard, `@Public()` opt-out, bcrypt ≥ 12, CASL |
| 11 | Configuration | HIGH | @nestjs/config, Joi validation, no `process.env` in services |
| 12 | Security Hardening | CRITICAL | Helmet, CORS, rate limiting, CSRF, global prefix |
| 13 | Error Handling | HIGH | Global exception filter, normalized responses, typed throws |
| 14 | Interceptors | HIGH | `{ data, meta }` envelope, `APP_INTERCEPTOR`, no `@Res()` |
| 15 | Logging | HIGH | Structured JSON logging, Logger class, Pino/Winston, requestId |
| 16 | Lifecycle Events | HIGH | `onModuleInit`, shutdown hooks, `enableShutdownHooks()` |
| 17 | Testing | HIGH | Unit + e2e, `overrideProvider`, ≥80% coverage on services |
| 18 | OpenAPI / Swagger | MEDIUM | DocumentBuilder, CLI plugin, disabled in production |
| 19 | Health Checks | HIGH | @nestjs/terminus, Kubernetes liveness/readiness probes |
| 20 | Scheduling & Events | MEDIUM | Cron try/catch, typed event classes, event-driven decoupling |
| 21 | File Upload | HIGH | ParseFilePipe validation, size limits, StreamableFile |
| 22 | Performance | MEDIUM | Redis cache, BullMQ, Fastify adapter, throttler |
| 23 | Multi-Tenancy | HIGH | REQUEST-scoped TenantContext, RLS, tenantId on every query |
| 24 | Code Style | HIGH | No `any`, explicit return types, 300-line limit, barrel files |

## How It Works

Once installed, your AI editor reads the skill files before generating or reviewing NestJS code. It follows the same patterns a senior architect would enforce in code review — automatically, on every file.

**Example:** Ask Claude Code or Cursor to "create a users module" and instead of generic boilerplate it will generate:
- A properly scoped `@Module()` with `exports`
- A controller that returns Response DTOs, not raw entities
- A service that throws typed `NotFoundException`, not raw `Error`
- A `CreateUserDto` with class-validator decorators
- A `users.service.spec.ts` test file alongside the service

## Manual Installation

If you prefer not to use npx:

```bash
git clone https://github.com/Ahmustufa/nestjs-best-practices-skill.git
cd nestjs-best-practices-skill
node bin/install.js
```

## Verification

After installation, restart your editor. For Claude Code, verify by asking:

> "What NestJS best practices skills do you have available?"

## Requirements

- Node.js 18+
- NestJS v10 or v11
- Claude Code, Cursor, or Windsurf

## FAQ

**Does this work with NestJS v11?**
Yes, all rules are compatible with NestJS v10 and v11.

**Does this work with Prisma instead of TypeORM?**
The TypeORM rules are TypeORM-specific, but all other 23 categories (auth, validation, security, testing, etc.) apply equally to Prisma projects.

**What's the difference between global and local install?**
Global installs the skill to your home directory and applies to all projects. Local installs to `.ai/skills/` in your current project directory.

**Does this replace `.cursorrules`?**
It works alongside `.cursorrules`. The skill provides deeper, structured NestJS-specific rules that are too detailed for a single rules file.

**Will this work with GitHub Copilot or other AI tools?**
Currently supports Claude Code, Cursor, and Windsurf. Open a PR or issue to request support for other tools.

## File Structure

```
nestjs-best-practices-skill/
  bin/install.js          # Interactive CLI installer
  SKILL.md                # Skill metadata and category index
  AGENTS.md               # Full compiled rules with all code examples
  rules/
    structure.md          # Project structure
    modules.md            # Module patterns
    middleware.md         # Middleware patterns
    controllers.md        # Controller rules
    services.md           # Service rules
    custom-providers.md   # DI patterns and scopes
    custom-decorators.md  # Param and composed decorators
    dto-validation.md     # Validation and serialization
    typeorm.md            # Database and migrations
    auth.md               # Authentication and authorization
    config.md             # Configuration management
    security-hardening.md # Helmet, CORS, rate limiting
    error-handling.md     # Exception filters
    interceptors.md       # Response transform, logging
    logging.md            # Structured logging
    lifecycle.md          # Lifecycle hooks, graceful shutdown
    testing.md            # Unit and e2e testing
    openapi.md            # Swagger/OpenAPI integration
    health-checks.md      # Terminus health indicators
    scheduling-events.md  # Cron and event emitter
    file-upload.md        # Upload validation and streaming
    performance.md        # Caching, queues, Fastify
    multi-tenancy.md      # SaaS multi-tenant patterns
    code-style.md         # TypeScript style rules
```

## Contributing

1. Fork the repository
2. Add or update rule files in `rules/`
3. Update `AGENTS.md` with the compiled changes
4. Update `SKILL.md` category table if adding new categories
5. Submit a pull request

## License

MIT
