# Rule: Interceptors & Logging

## Why It Matters
Inconsistent response shapes break API consumers. Without structured logging and request IDs, debugging distributed issues is nearly impossible.

## Rules

- Use a `TransformInterceptor` to wrap all responses in a `{ data, meta }` envelope.
- Use a `LoggingInterceptor` to log method, path, duration, and status.
- Propagate a `requestId` via `AsyncLocalStorage` or a `REQUEST`-scoped provider.

## Transform Interceptor

```typescript
// common/interceptors/transform.interceptor.ts
export interface Response<T> {
  data: T;
  meta: { timestamp: string; requestId: string };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const requestId = context.switchToHttp().getRequest().requestId;
    return next.handle().pipe(
      map((data) => ({
        data,
        meta: { timestamp: new Date().toISOString(), requestId },
      })),
    );
  }
}
```

## Logging Interceptor

```typescript
// common/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`${method} ${url} — ${Date.now() - start}ms`);
      }),
    );
  }
}
```

## Request ID Middleware

```typescript
// common/middleware/request-id.middleware.ts
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    req['requestId'] = crypto.randomUUID();
    next();
  }
}
```
