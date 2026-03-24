# NestJS Best Practices — AI IDE Skill

A comprehensive best practices skill for Claude Code, Cursor, Windsurf, and other agentic CLI tools. Makes your AI assistant act as a senior NestJS architect when writing, reviewing, or refactoring code.

## Quick Install

```bash
npx nestjs-best-practices-skill
```

The interactive installer will ask which tool to install for:

```
  ╔══════════════════════════════════════════════╗
  ║   NestJS Best Practices Skill Installer      ║
  ║   24 production-ready rules for your AI IDE   ║
  ╚══════════════════════════════════════════════╝

  Where would you like to install?

    1) Claude Code
    2) Cursor
    3) Windsurf
    4) Custom path
    5) All supported tools

  Enter your choice (number):
```

## What It Does

When triggered, your AI assistant automatically applies 24 categories of production best practices:

| Category | What It Enforces |
|----------|-----------------|
| Project Structure | Domain-driven feature modules |
| Modules | Encapsulation, `@Global()` restraint, dynamic modules |
| Middleware | Execution order, functional vs class-based |
| Controllers | HTTP-only, versioned routes, DTO responses |
| Services | Business logic isolation, typed exceptions |
| Custom Providers | useClass/useValue/useFactory, injection scopes |
| Custom Decorators | Param decorators, composed decorators |
| DTOs & Validation | class-validator, whitelist, transform |
| TypeORM / Database | Migrations, transactions, base entity |
| Auth & Authorization | JWT global guard, roles, bcrypt |
| Configuration | @nestjs/config, Joi validation, no process.env |
| Security Hardening | Helmet, CORS, rate limiting, CSRF |
| Error Handling | Global exception filter, normalized responses |
| Interceptors | Response envelope, request ID |
| Logging | Structured logging, Logger class |
| Lifecycle Events | Shutdown hooks, graceful shutdown |
| Testing | Unit + e2e, mocking patterns, 80%+ coverage |
| OpenAPI / Swagger | Auto-docs, production security |
| Health Checks | @nestjs/terminus, Kubernetes probes |
| Scheduling & Events | Cron jobs, event-driven decoupling |
| File Upload | Validation, size limits, streaming |
| Performance | Redis cache, BullMQ, Fastify, throttler |
| Multi-Tenancy | TenantContext, RLS, tenantId guard |
| Code Style | No `any`, explicit types, 300-line limit |

## Manual Installation

If you prefer not to use npx:

```bash
# Clone
git clone https://github.com/Ahmustufa/nestjs-best-practices-skill.git

# Copy to Claude Code
cp -r nestjs-best-practices-skill ~/.claude/skills/nestjs-best-practices

# Or symlink (macOS/Linux)
ln -s /path/to/nestjs-best-practices-skill ~/.claude/skills/nestjs-best-practices

# Or symlink (Windows PowerShell as Admin)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\skills\nestjs-best-practices" -Target "C:\path\to\nestjs-best-practices-skill"
```

## Verification

After installation, restart your IDE. For Claude Code, verify by asking:

> "What NestJS best practices skills do you have available?"

## File Structure

```
nestjs-best-practices-skill/
  bin/install.js          # Interactive CLI installer
  SKILL.md                # Skill metadata and category index
  AGENTS.md               # Full compiled rules with all code examples
  rules/
    structure.md          # Project structure
    modules.md            # Module patterns
    middleware.md          # Middleware patterns
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
