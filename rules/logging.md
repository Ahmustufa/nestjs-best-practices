# Rule: Logging

## Why It Matters
`console.log` is unstructured, lacks context, and cannot be filtered by level. Production systems need structured, leveled logging with request correlation.

## Rules

- Use the built-in `Logger` class from `@nestjs/common` — instantiate with service name as context.
- Replace the built-in logger with a production-grade implementation (Winston, Pino) via `app.useLogger()`.
- Use structured JSON logging in production for log aggregation tools (ELK, Datadog, etc.).
- Log at appropriate levels: `error` for failures, `warn` for degraded state, `log` for operational info, `debug`/`verbose` for development.
- Never log sensitive data (passwords, tokens, PII).
- Propagate a `requestId` for cross-service request tracing.

## Built-in Logger

```typescript
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async create(dto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${dto.email}`);
    try {
      const user = await this.userRepo.save(this.userRepo.create(dto));
      this.logger.log(`User created: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${dto.email}`, error.stack);
      throw error;
    }
  }
}
```

## Custom Logger (Pino Example)

```typescript
// main.ts
import { Logger as PinoLogger } from 'nestjs-pino';

const app = await NestFactory.create(AppModule, { bufferLogs: true });
app.useLogger(app.get(PinoLogger));
```

## Log Levels Configuration

```typescript
// Restrict logs in production
NestFactory.create(AppModule, {
  logger: process.env.NODE_ENV === 'production'
    ? ['error', 'warn', 'log']
    : ['error', 'warn', 'log', 'debug', 'verbose'],
});
```
