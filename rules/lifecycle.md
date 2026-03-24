# Rule: Lifecycle Events

## Why It Matters
Without proper lifecycle management, connections leak, caches go unprimed, and graceful shutdown fails — causing dropped requests and data corruption.

## Hook Execution Order

```
onModuleInit → onApplicationBootstrap → (app running) → onModuleDestroy → beforeApplicationShutdown → onApplicationShutdown
```

## Rules

- Implement `OnModuleInit` for logic that runs after all dependencies are resolved (priming caches, loading config).
- Implement `OnApplicationBootstrap` for logic after the entire app is ready to receive connections.
- Implement `OnModuleDestroy` and `OnApplicationShutdown` for cleanup (closing DB connections, releasing resources).
- **Call `app.enableShutdownHooks()`** to listen for SIGTERM/SIGINT — without this, shutdown hooks are NOT called.
- All lifecycle hooks can be async — NestJS will await them.
- `beforeApplicationShutdown(signal)` runs before connections close — use for graceful draining.
- `onApplicationShutdown(signal)` runs after connections close — use for final cleanup.

## Example

```typescript
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }
}
```

## Main Bootstrap

```typescript
// main.ts
const app = await NestFactory.create(AppModule);
app.enableShutdownHooks(); // REQUIRED for graceful shutdown
await app.listen(3000);
```

## Caution

`enableShutdownHooks()` consumes memory due to event listeners. In test environments with many Jest workers, call `app.close()` manually in `afterAll()` instead.
