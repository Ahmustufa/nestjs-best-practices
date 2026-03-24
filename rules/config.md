# Rule: Configuration

## Why It Matters
Direct `process.env` access bypasses validation, making missing vars fail at runtime instead of startup. Typed config prevents typos and provides IDE support.

## Rules

- Use `@nestjs/config` with `ConfigService` — never access `process.env` outside config files.
- Validate all env vars at startup with a Joi schema.
- Use `registerAs` namespaces to avoid key collisions.
- Load config in `AppModule` with `isGlobal: true`.

## Joi Validation Schema

```typescript
// config/env.validation.ts
import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
});
```

## Namespaced Config

```typescript
// config/app.config.ts
export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV,
}));

// config/jwt.config.ts
export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));
```

## App Module

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
      load: [appConfig, jwtConfig],
    }),
  ],
})
export class AppModule {}
```

## Typed Access in Services

```typescript
// ✅ Typed, validated
this.configService.get<string>('jwt.secret');
this.configService.get<number>('app.port');

// ❌ Never do this in services
process.env.JWT_SECRET
```
