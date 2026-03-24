# Rule: Middleware

## Why It Matters
Middleware executes before guards, interceptors, and pipes. Incorrect middleware can hang requests, break DI, or interfere with body parsing.

## Execution Order

```
Middleware → Guards → Interceptors (before) → Pipes → Handler → Interceptors (after) → Exception Filters
```

## Rules

- Always call `next()` or the request will hang indefinitely.
- Prefer **functional middleware** when no dependencies are needed — simpler and lighter.
- Use **class-based middleware** when dependency injection is required.
- Middleware cannot be declared in `@Module()` — use `NestModule.configure()` with `MiddlewareConsumer`.
- Apply middleware to specific routes using `forRoutes()` with paths, HTTP methods, or controller classes.
- Stack multiple middleware in `apply()` separated by commas — they execute in declaration order.
- Global middleware via `app.use()` does NOT have DI access. For DI-aware global middleware, bind with `.forRoutes('*')`.

## Class-Based Middleware

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction): void {
    this.logger.log(`${req.method} ${req.url}`);
    next();
  }
}
```

## Functional Middleware

```typescript
// Preferred when no DI is needed
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // simple logic
  next();
}
```

## Registration

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware)
      .exclude({ path: 'health', method: RequestMethod.GET })
      .forRoutes('*');
  }
}
```
