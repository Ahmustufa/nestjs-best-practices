# Rule: Performance & Scalability

## Why It Matters
Blocking the event loop or skipping caching causes latency spikes under load. Fastify and Redis can 2-3x throughput with minimal code changes.

## Rules

- Use `CacheModule` (Redis-backed) for expensive reads.
- Offload heavy work to `BullMQ` queues — never block the event loop in a request handler.
- Enable Fastify adapter for high-throughput APIs.
- Use `@nestjs/throttler` for rate limiting.
- Add `compression` middleware and `helmet` in production.

## Fastify Adapter

```typescript
// main.ts
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
);
```

## Cache Module (Redis)

```typescript
// app.module.ts
CacheModule.registerAsync({
  isGlobal: true,
  useFactory: (config: ConfigService) => ({
    store: redisStore,
    host: config.get('REDIS_HOST'),
    port: config.get('REDIS_PORT'),
    ttl: 60,
  }),
  inject: [ConfigService],
}),
```

```typescript
// In a service
@Injectable()
export class ProductsService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async findAll(): Promise<Product[]> {
    const cached = await this.cache.get<Product[]>('products');
    if (cached) return cached;
    const products = await this.productRepo.find();
    await this.cache.set('products', products, 60);
    return products;
  }
}
```

## BullMQ Queue

```typescript
// Queue producer
@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendWelcome(userId: string): Promise<void> {
    await this.emailQueue.add('welcome', { userId });
  }
}

// Queue processor
@Processor('email')
export class EmailProcessor {
  @Process('welcome')
  async handleWelcome(job: Job<{ userId: string }>): Promise<void> {
    // heavy work here, not blocking HTTP handlers
  }
}
```

## Throttler

```typescript
// app.module.ts
ThrottlerModule.forRoot({ ttl: 60, limit: 100 }),

// controller
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {}
```

## Production Hardening

```typescript
// main.ts
import helmet from 'helmet';
import compression from 'compression';

app.use(helmet());
app.use(compression());
```
