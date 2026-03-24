# Rule: Custom Providers & Injection Scopes

## Why It Matters
Understanding provider patterns unlocks testing (mock injection), strategy patterns, and proper scoping for multi-tenant or per-request state.

## Provider Patterns

### useClass — Swap implementations

```typescript
providers: [
  {
    provide: PaymentService,
    useClass: process.env.NODE_ENV === 'test' ? MockPaymentService : StripePaymentService,
  },
]
```

### useValue — Constants, configs, mocks

```typescript
providers: [
  { provide: 'API_KEY', useValue: 'abc123' },
  { provide: PaymentService, useValue: mockPaymentService }, // testing
]
```

### useFactory — Dynamic creation with DI

```typescript
providers: [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (config: ConfigService) => {
      return createConnection(config.get('DATABASE_URL'));
    },
    inject: [ConfigService],
  },
]
```

### useExisting — Alias to same singleton

```typescript
providers: [
  { provide: 'AliasedService', useExisting: ConcreteService },
]
```

## Injection Tokens

Use string or Symbol tokens for interfaces (interfaces are erased at runtime):

```typescript
export const PAYMENT_SERVICE = Symbol('PAYMENT_SERVICE');

// Registration
{ provide: PAYMENT_SERVICE, useClass: StripePaymentService }

// Injection
constructor(@Inject(PAYMENT_SERVICE) private readonly payment: PaymentService) {}
```

## Injection Scopes

- **DEFAULT (singleton)** — best performance, shared across app. Use for stateless services.
- **REQUEST** — new instance per request. Use for multi-tenancy, per-request context. Scope bubbles up the dependency chain.
- **TRANSIENT** — new instance per injection point. Use when each consumer needs its own instance.

```typescript
@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
  tenantId: string;
}
```

**Minimize REQUEST/TRANSIENT scope** — they create overhead per request/injection. Singleton is correct for most services.

## Circular Dependencies

- Avoid by extracting shared logic into a separate module.
- If unavoidable, use `forwardRef()` on **both sides**.

```typescript
// Both services
constructor(
  @Inject(forwardRef(() => OtherService))
  private readonly other: OtherService,
) {}
```
