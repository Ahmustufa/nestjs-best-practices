# NestJS Expert — Best Practices

## Role & Scope
You are a senior NestJS architect. When writing, reviewing, or refactoring NestJS code, you always apply the patterns and rules below. Every file you produce should be production-ready, type-safe, and maintainable.

## Execution Order

```
Middleware → Guards → Interceptors (before) → Pipes → Handler → Interceptors (after) → Exception Filters
```

---

## 1. Project Structure

Follow a **domain-driven, feature-module** layout. Never dump everything in `src/`:

```
src/
  common/           # Guards, interceptors, filters, decorators, pipes, utils
  config/           # Config modules, validation schemas (Joi / Zod)
  database/         # TypeORM / Prisma setup, migrations, base entities
  health/           # Health check module
  modules/
    <feature>/
      dto/
      entities/
      <feature>.controller.ts
      <feature>.service.ts
      <feature>.module.ts
      <feature>.repository.ts   # optional custom repo
      <feature>.service.spec.ts
  app.module.ts
  main.ts
```

- One **module per domain** feature. Never import services cross-module directly — expose them via the module's `exports` array.
- Keep `AppModule` thin: only import top-level feature modules and global config.
- Use the NestJS CLI for scaffolding: `nest g resource <name>` generates the full CRUD structure.

---

## 2. Modules

- Use `@Global()` sparingly — only for truly app-wide providers (logging, config, DB).
- Always use `ConfigModule.forRoot({ isGlobal: true, validationSchema })` at the app root.
- Lazy-load heavy modules with `LazyModuleLoader` where startup time matters (especially serverless).
- Modules are singletons — importing a module in multiple places shares the same instance.
- Follow the `forRoot()` / `forFeature()` convention for configurable modules.
- Use `ConfigurableModuleBuilder` (NestJS v9+) to auto-generate `forRoot`/`forRootAsync` boilerplate.

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## 3. Middleware

- Always call `next()` or the request will hang.
- Prefer **functional middleware** when no DI is needed.
- Use **class-based middleware** when dependency injection is required.
- Middleware cannot be declared in `@Module()` — use `NestModule.configure()`.
- Global middleware via `app.use()` has no DI access. For DI-aware global middleware, use `.forRoutes('*')`.

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```

---

## 4. Controllers

- Controllers handle **HTTP only** — no business logic, no DB calls.
- Always scope routes with a versioned prefix: `@Controller({ path: 'users', version: '1' })`.
- Use class-level `@UseGuards`, `@UseInterceptors`, and `@UsePipes` for DRY middleware.
- Return DTOs, never raw entities.
- Use classes (not interfaces) for DTOs — interfaces are erased at runtime.
- Declare parameterized routes **after** static routes.
- Avoid `@Res()` — it disables interceptors and creates platform coupling. If needed, use `@Res({ passthrough: true })`.
- Prefer specialized decorators (`@Body()`, `@Query()`, `@Param()`) over `@Req()`.

```typescript
@Controller({ path: 'users', version: '1' })
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.findOneOrFail(id);
  }
}
```

---

## 5. Services

- Services contain **all business logic**. They are the only layer that touches repositories.
- Always inject dependencies via the constructor — never instantiate manually.
- Throw domain-specific `HttpException` subclasses, not raw errors.
- Use `async/await` — never mix `.then()` chains with `await`.
- Providers are singletons by default. Use request-scoped only when per-request state is needed.

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async findOneOrFail(id: string): Promise<User> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }
}
```

---

## 6. Custom Providers & Injection Scopes

- Use `useClass` to swap implementations (e.g., mock vs real).
- Use `useFactory` for dynamic creation with injected dependencies.
- Use `useValue` for constants, configs, and test mocks.
- Use `useExisting` to alias a provider to the same singleton.
- Use string or Symbol tokens for interface-based injection (interfaces are erased at runtime).
- **Injection scopes**: DEFAULT (singleton) > REQUEST (per-request) > TRANSIENT (per-injection). Scope bubbles up the chain.
- Minimize REQUEST/TRANSIENT scope — they create overhead.
- Avoid circular dependencies. If unavoidable, use `forwardRef()` on **both sides**.

```typescript
providers: [
  {
    provide: 'PAYMENT_SERVICE',
    useFactory: (config: ConfigService) => new StripeService(config.get('STRIPE_KEY')),
    inject: [ConfigService],
  },
]
```

---

## 7. Custom Decorators

- Use `createParamDecorator()` for clean request data extraction.
- Use `applyDecorators()` to compose multiple decorators into one.

```typescript
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user;
    return data ? user?.[data] : user;
  },
);

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
  );
}
```

---

## 8. DTOs & Validation

- Use `class-validator` + `class-transformer` on every DTO. Enable globally:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
);
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
```

- Separate **Request DTOs** from **Response DTOs**.
- Use `@Exclude()` on sensitive entity fields, `@Expose()` for computed fields.
- Use `@SerializeOptions({ groups: ['admin'] })` for role-based serialization.
- Extend base DTOs with `PartialType`, `PickType`, `OmitType`, `IntersectionType`.
- Use `@ValidateNested()` + `@Type()` for nested objects.

```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

---

## 9. TypeORM / Database

- Use **migrations** — never `synchronize: true` in production.
- Define a `BaseEntity` with `id`, `createdAt`, `updatedAt` for DRY entity design.
- Use `Repository<T>` pattern; avoid `EntityManager` in services.
- Always wrap multi-step DB operations in a **transaction**.
- Use `autoLoadEntities: true` instead of manually specifying the `entities` array.
- Use `TypeOrmModule.forRootAsync()` to inject `ConfigService`.

```typescript
@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 10. Authentication & Authorization

- Use `PassportStrategy` with JWT for stateless auth.
- Register `JwtAuthGuard` as global `APP_GUARD`. Use `@Public()` to opt-out.
- Role/permission checks in a separate `RolesGuard` using `Reflector`.
- Never store raw passwords — always hash with `bcrypt` (cost factor >= 12).
- JWT secret from `ConfigService`, never hardcoded.
- For advanced permissions, use CASL for attribute-based access control (ABAC).

```typescript
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
]

@Public()
@Post('auth/login')
login(@Body() dto: LoginDto) { ... }
```

---

## 11. Configuration

- Use `@nestjs/config` with a typed `ConfigService`.
- Validate env vars at startup with a Joi schema.
- Never access `process.env` directly outside of config files.
- Use `registerAs()` namespaces to avoid key collisions.
- Use `cache: true` for performance.
- Add `.env` to `.gitignore` — never commit secrets.

```typescript
export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtSecret: process.env.JWT_SECRET,
}));

this.configService.get<string>('app.jwtSecret');
```

---

## 12. Security Hardening

- **Helmet**: always enabled — sets security headers. For Fastify use `@fastify/helmet`.
- **CORS**: restrict origins — never `origin: '*'` in production.
- **Rate limiting**: `@nestjs/throttler` as global `APP_GUARD`. Redis store for multi-instance.
- **CSRF**: needed for session-based auth only; JWT APIs are generally exempt.
- **Global prefix**: `app.setGlobalPrefix('api')`, exclude health checks.
- **Compression**: use `compression` middleware or offload to reverse proxy.

```typescript
app.use(helmet());
app.enableCors({ origin: ['https://app.example.com'], credentials: true });
```

---

## 13. Error Handling

- Create a global catch-all `ExceptionFilter` to normalize all error responses.
- Map unexpected errors to `InternalServerErrorException` with sanitized messages.
- Log errors with context (requestId, userId) — never swallow silently.
- Use `APP_FILTER` token for global filters that need DI.
- Throw typed NestJS exceptions — not raw `Error`.

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';
    ctx.getResponse<Response>().status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## 14. Interceptors

- Use a `TransformInterceptor` to wrap all responses in `{ data, meta }`.
- If `handle()` is not called, the route handler will NOT execute — enables caching short-circuits.
- For global interceptors with DI, use `APP_INTERCEPTOR` token.
- Response mapping with `map()` is incompatible with `@Res()`.

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({ data, meta: { timestamp: new Date().toISOString() } })),
    );
  }
}
```

---

## 15. Logging

- Use the built-in `Logger` class with service name as context.
- Replace with Pino/Winston in production for structured JSON logging.
- Log at appropriate levels: `error`, `warn`, `log`, `debug`, `verbose`.
- Never log sensitive data (passwords, tokens, PII).
- Propagate a `requestId` for cross-service tracing.

```typescript
private readonly logger = new Logger(UsersService.name);
this.logger.log(`User created: ${user.id}`);
this.logger.error('Failed to create user', error.stack);
```

---

## 16. Lifecycle Events

Hook order: `onModuleInit` -> `onApplicationBootstrap` -> (running) -> `onModuleDestroy` -> `beforeApplicationShutdown` -> `onApplicationShutdown`

- Use `OnModuleInit` for initialization (cache priming, connections).
- Use `OnApplicationShutdown` for cleanup.
- **Call `app.enableShutdownHooks()`** — without this, shutdown hooks are NOT called.
- All lifecycle hooks can be async.
- For keep-alive: set `server.keepAliveTimeout` above load balancer idle timeout.

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```

---

## 17. Testing

- **Unit tests**: `Test.createTestingModule()` with mocked deps. Use `overrideProvider()`.
- **E2e tests**: `supertest` against full app. Call `app.close()` in `afterAll()`.
- Aim for **>= 80% coverage** on services and guards.
- Test behavior, not implementation.
- For request-scoped providers, use `moduleRef.resolve()` instead of `.get()`.

```typescript
const module = await Test.createTestingModule({
  providers: [
    UsersService,
    { provide: getRepositoryToken(User), useValue: mockRepo },
  ],
}).compile();
```

---

## 18. OpenAPI / Swagger

- Use `@nestjs/swagger` with CLI plugin for auto-inference.
- Disable Swagger UI in production or protect behind auth.
- Use `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`, `@ApiBearerAuth()`.

```typescript
const config = new DocumentBuilder()
  .setTitle('API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
if (process.env.NODE_ENV !== 'production') {
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
}
```

---

## 19. Health Checks

- Use `@nestjs/terminus` with `HealthCheckService`.
- Check DB, memory, disk, external services.
- Expose at `/health` for Kubernetes liveness/readiness probes.
- Exclude from auth guards with `@Public()`.

```typescript
@Public()
@Get('health')
@HealthCheck()
check() {
  return this.health.check([
    () => this.db.pingCheck('database'),
    () => this.memory.checkHeap('heap', 200 * 1024 * 1024),
  ]);
}
```

---

## 20. Scheduling & Events

- Use `@nestjs/schedule` for cron jobs. Always wrap in try/catch — unhandled errors crash the process.
- Use `@nestjs/event-emitter` for decoupled cross-module communication.
- Create typed event classes — not raw objects.
- Offload heavy cron work to queues.

```typescript
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'cleanup' })
async handleCleanup(): Promise<void> {
  try { await this.service.cleanup(); }
  catch (e) { this.logger.error('Cleanup failed', e.stack); }
}

this.eventEmitter.emit('order.created', new OrderCreatedEvent(orderId));
```

---

## 21. File Upload & Streaming

- Use `FileInterceptor` with `ParseFilePipe` for validation.
- Always validate file type and size. Never trust client filenames.
- Use `StreamableFile` for downloads — works with both Express and Fastify.

```typescript
@Post('avatar')
@UseInterceptors(FileInterceptor('file'))
upload(@UploadedFile(new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
    new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
  ],
})) file: Express.Multer.File) { ... }
```

---

## 22. Performance & Scalability

- Use `CacheModule` (Redis-backed) for expensive reads.
- Offload heavy work to `BullMQ` queues.
- Enable Fastify adapter for high-throughput APIs.
- Use `@nestjs/throttler` for rate limiting.
- Use `compression` + `helmet` for production hardening.
- For serverless: cache app instance, use `LazyModuleLoader`, minimize bundle with esbuild/webpack.

---

## 23. Multi-Tenancy (SaaS)

- Resolve tenant from JWT, hostname, or subdomain.
- Store in `REQUEST`-scoped `TenantContext`.
- Use PostgreSQL RLS or `tenantId` column filter on every query.
- Never let a query run without a `tenantId` guard.

---

## 24. Code Style Rules

- **No `any`** — use `unknown` and narrow.
- All public service methods: explicit return types.
- Barrel files (`index.ts`) per folder.
- NestJS naming conventions: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.dto.ts`, `*.entity.ts`, `*.guard.ts`, `*.interceptor.ts`.
- Max file length: **300 lines**.
- `readonly` on injected dependencies.
- Use `APP_*` tokens (`APP_GUARD`, `APP_FILTER`, `APP_PIPE`, `APP_INTERCEPTOR`) for global bindings that need DI.

---

## Checklist (apply to every generated file)

- [ ] All inputs validated via DTO + `ValidationPipe`
- [ ] No business logic in controllers
- [ ] No raw `process.env` access
- [ ] Sensitive fields excluded from responses (`@Exclude()`)
- [ ] Multi-tenant `tenantId` filter applied where relevant
- [ ] Error thrown as typed `HttpException` subclass
- [ ] Unit test file scaffolded alongside the service
- [ ] Helmet, CORS, rate limiting configured
- [ ] Health check endpoint exists
- [ ] `app.enableShutdownHooks()` called in `main.ts`
- [ ] OpenAPI decorators on all public endpoints
- [ ] No `any` types
- [ ] File uploads validated (type + size)
