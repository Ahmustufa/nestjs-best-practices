# Rule: Project Structure

## Why It Matters
A flat `src/` directory becomes unmanageable at scale. Domain-driven feature modules make ownership, testing, and code-splitting straightforward.

## Directory Layout

```
src/
  common/           # Guards, interceptors, filters, decorators, pipes, utils
  config/           # Config modules, validation schemas (Joi / Zod)
  database/         # TypeORM / Prisma setup, migrations, base entities
  modules/
    <feature>/
      dto/
      entities/
      <feature>.controller.ts
      <feature>.service.ts
      <feature>.module.ts
      <feature>.repository.ts   # optional custom repo
  app.module.ts
  main.ts
```

## Rules

- One **module per domain** feature.
- Never import services cross-module directly — expose them via the module's `exports` array.
- Keep `AppModule` thin: only top-level feature modules + global config.
- Use barrel files (`index.ts`) per folder to clean up imports.

## Bad

```typescript
// ❌ Importing a service directly from another module's file
import { OrdersService } from '../orders/orders.service';
```

## Good

```typescript
// ✅ Orders module exports the service; Users module imports OrdersModule
@Module({ imports: [OrdersModule] })
export class UsersModule {}
```
