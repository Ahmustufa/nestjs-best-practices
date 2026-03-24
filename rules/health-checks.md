# Rule: Health Checks

## Why It Matters
Without health endpoints, load balancers, Kubernetes probes, and monitoring tools cannot detect degraded service state.

## Rules

- Use `@nestjs/terminus` with built-in health indicators.
- Create a dedicated `HealthController` at `GET /health`.
- Check **all critical dependencies**: DB connectivity, external services, memory, disk.
- Keep health check logic lightweight — avoid expensive queries.
- Exclude health endpoint from global prefix and auth guards.

## Setup

```typescript
// health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024), // 200 MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),   // 300 MB
      () => this.disk.checkStorage('disk', { thresholdPercent: 0.9, path: '/' }),
    ]);
  }
}
```

## Module

```typescript
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
```

## Kubernetes Probes

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 15
readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```
