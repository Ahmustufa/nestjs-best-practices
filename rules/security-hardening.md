# Rule: Security Hardening

## Why It Matters
Missing security headers, open CORS, and absent rate limiting are the most common attack vectors in production NestJS apps.

## Rules

### Helmet (Required)
- Always use Helmet in production — sets X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options, etc.
- Apply early in the middleware stack.
- For Fastify, use `@fastify/helmet` instead.

```typescript
import helmet from 'helmet';
app.use(helmet());
```

### CORS
- Enable CORS explicitly — never use `origin: '*'` in production.
- Restrict to specific allowed origins.

```typescript
app.enableCors({
  origin: ['https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
});
```

### Rate Limiting
- Use `@nestjs/throttler` with `ThrottlerGuard` as global `APP_GUARD`.
- Use `@SkipThrottle()` to exempt specific routes.
- Use `@Throttle()` to set stricter limits on sensitive routes (login, password reset).
- Use Redis-backed storage for multi-instance deployments.

```typescript
// app.module.ts
ThrottlerModule.forRoot([
  { name: 'short', ttl: 1000, limit: 3 },     // 3 req/sec
  { name: 'medium', ttl: 60000, limit: 60 },   // 60 req/min
]),

providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
```

### CSRF
- CSRF protection is primarily needed for session-based auth with server-rendered pages.
- For pure JWT Bearer token APIs, CSRF is generally not required.
- If using sessions, apply `csurf` or `csrf-csrf` middleware after cookie-parser.

### Cookies
- Always set `httpOnly: true`, `secure: true` (production), and `sameSite` on cookies.

### Global Prefix
- Use `app.setGlobalPrefix('api')` to namespace API routes.
- Exclude health checks: `app.setGlobalPrefix('api', { exclude: ['health'] })`.

### Production Checklist
- [ ] Helmet enabled
- [ ] CORS restricted to known origins
- [ ] Rate limiting active (Redis-backed in multi-instance)
- [ ] Validation pipe with whitelist + forbidNonWhitelisted
- [ ] No raw error stack traces in responses
- [ ] JWT secrets from ConfigService, not hardcoded
- [ ] `synchronize: false` on TypeORM
- [ ] Compression enabled (or offloaded to reverse proxy)
