# Rule: Error Handling

## Why It Matters
Unhandled exceptions leak stack traces to clients. Inconsistent error shapes break API consumers.

## Rules

- Create a global `HttpExceptionFilter` to normalize all error responses.
- Map unexpected errors to `InternalServerErrorException` with sanitized messages in production.
- Log errors with context (requestId, userId) — never swallow silently.
- Throw typed NestJS exceptions in services, not raw `Error`.

## Global Exception Filter

```typescript
// common/filters/http-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    this.logger.error({
      statusCode: status,
      path: request.url,
      method: request.method,
      exception,
    });

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

## Register Globally

```typescript
// main.ts
app.useGlobalFilters(new AllExceptionsFilter(new Logger()));
```

## Typed Exceptions in Services

```typescript
// ✅ Typed with HTTP semantics
throw new NotFoundException(`User ${id} not found`);
throw new ConflictException('Email already in use');
throw new UnauthorizedException('Invalid credentials');
throw new BadRequestException('Validation failed');

// ❌ Raw error — no HTTP status, no structured response
throw new Error('not found');
```
