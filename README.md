# NestJS Best Practices — Claude Code Skill

A comprehensive [Claude Code skill](https://docs.anthropic.com/en/docs/claude-code/skills) that makes Claude apply NestJS production best practices when writing, reviewing, or refactoring code.

## What It Does

When triggered, Claude acts as a senior NestJS architect and automatically applies 24 categories of best practices:

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

## Installation

### Option 1: Install from npm

```bash
npm install -g nestjs-best-practices-skill
```

Then symlink into your Claude Code skills directory:

```bash
# macOS / Linux
ln -s $(npm root -g)/nestjs-best-practices-skill ~/.claude/skills/nestjs-best-practices

# Windows (PowerShell as Administrator)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\skills\nestjs-best-practices" -Target "$(npm root -g)\nestjs-best-practices-skill"
```

### Option 2: Manual installation

Clone or download this repo, then copy/symlink into your skills directory:

```bash
# Clone
git clone https://github.com/<your-username>/nestjs-best-practices-skill.git

# macOS / Linux
ln -s /path/to/nestjs-best-practices-skill ~/.claude/skills/nestjs-best-practices

# Windows (PowerShell as Administrator)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\skills\nestjs-best-practices" -Target "C:\path\to\nestjs-best-practices-skill"
```

### Option 3: Direct copy

```bash
cp -r nestjs-best-practices-skill ~/.claude/skills/nestjs-best-practices
```

## Verification

After installation, restart Claude Code. The skill should appear in the available skills list. You can verify by asking Claude:

> "What NestJS best practices skills do you have available?"

## File Structure

```
nestjs-best-practices-skill/
  SKILL.md              # Skill metadata and category index
  AGENTS.md             # Full compiled rules with all code examples
  README.md             # This file
  rules/
    structure.md        # Project structure
    modules.md          # Module patterns
    middleware.md        # Middleware patterns
    controllers.md      # Controller rules
    services.md         # Service rules
    custom-providers.md # DI patterns and scopes
    custom-decorators.md# Param and composed decorators
    dto-validation.md   # Validation and serialization
    typeorm.md          # Database and migrations
    auth.md             # Authentication and authorization
    config.md           # Configuration management
    security-hardening.md # Helmet, CORS, rate limiting
    error-handling.md   # Exception filters
    interceptors.md     # Response transform, logging
    logging.md          # Structured logging
    lifecycle.md        # Lifecycle hooks, graceful shutdown
    testing.md          # Unit and e2e testing
    openapi.md          # Swagger/OpenAPI integration
    health-checks.md    # Terminus health indicators
    scheduling-events.md# Cron and event emitter
    file-upload.md      # Upload validation and streaming
    performance.md      # Caching, queues, Fastify
    multi-tenancy.md    # SaaS multi-tenant patterns
    code-style.md       # TypeScript style rules
```

## Publishing to npm

To publish this skill as an npm package:

### 1. Set up your npm account

```bash
# Create an account at https://www.npmjs.com/signup if you don't have one
npm login
```

### 2. Choose a unique package name

Edit `package.json` and set a unique `name` field. If `nestjs-best-practices-skill` is taken, use a scoped name:

```json
{
  "name": "@your-username/nestjs-best-practices-skill"
}
```

### 3. Publish

```bash
# First time
npm publish --access public

# Subsequent updates — bump version first
npm version patch  # or minor, major
npm publish
```

### 4. Verify

```bash
npm info nestjs-best-practices-skill
```

## Contributing

1. Fork the repository
2. Add or update rule files in `rules/`
3. Update `AGENTS.md` with the compiled changes
4. Update `SKILL.md` category table if adding new categories
5. Submit a pull request

## License

MIT
