# Rule: Task Scheduling & Events

## Why It Matters
Cron jobs without proper error handling crash the process. Tightly coupled services without events create brittle architectures.

## Task Scheduling

- Use `@nestjs/schedule` with `ScheduleModule.forRoot()`.
- Use `@Cron()` with `CronExpression` enum for readability.
- Name cron jobs for dynamic control via `SchedulerRegistry`.
- Handle errors in scheduled tasks — unhandled exceptions crash the process.
- Never run long-blocking tasks in cron handlers — offload to queues.

```typescript
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'cleanupExpiredTokens' })
  async handleCleanup(): Promise<void> {
    try {
      const count = await this.tokenService.deleteExpired();
      this.logger.log(`Cleaned up ${count} expired tokens`);
    } catch (error) {
      this.logger.error('Token cleanup failed', error.stack);
    }
  }
}
```

## Event-Based Communication

- Use `@nestjs/event-emitter` (wraps `eventemitter2`) for decoupled cross-module communication.
- Create typed event classes as payloads — not raw objects.
- Use dot-notation naming: `order.created`, `user.updated`.
- Use wildcard listeners (`@OnEvent('order.*')`) for namespace-level handling.

```typescript
// events/order-created.event.ts
export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly total: number,
  ) {}
}

// orders/orders.service.ts
@Injectable()
export class OrdersService {
  constructor(private eventEmitter: EventEmitter2) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = await this.orderRepo.save(this.orderRepo.create(dto));
    this.eventEmitter.emit('order.created', new OrderCreatedEvent(order.id, order.userId, order.total));
    return order;
  }
}

// notifications/notification.listener.ts
@Injectable()
export class NotificationListener {
  @OnEvent('order.created')
  handleOrderCreated(event: OrderCreatedEvent): void {
    // Send notification — decoupled from OrdersService
  }
}
```
