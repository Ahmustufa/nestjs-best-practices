# Rule: Multi-Tenancy (SaaS)

## Why It Matters
In a multi-tenant app, a single missing `tenantId` filter can expose one tenant's data to another — a critical security and compliance failure.

## Rules

- Resolve tenant from JWT claim, hostname, or subdomain in a guard/interceptor.
- Store tenant context in a `REQUEST`-scoped `TenantContext` provider.
- Use PostgreSQL **row-level security (RLS)** or a `tenantId` column filter on every query.
- Never let a query run without a `tenantId` guard in multi-tenant services.

## Tenant Context Provider

```typescript
// common/tenant/tenant-context.ts
@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
  tenantId: string;
}
```

## Tenant Guard

```typescript
// common/guards/tenant.guard.ts
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly tenantContext: TenantContext) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId; // from JWT payload
    if (!tenantId) throw new UnauthorizedException('Missing tenant context');
    this.tenantContext.tenantId = tenantId;
    return true;
  }
}
```

## Tenant-Safe Repository

```typescript
@Injectable()
export class TenantsProductsRepository {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    private readonly tenantContext: TenantContext,
  ) {}

  findAll(): Promise<Product[]> {
    // ✅ tenantId always applied
    return this.repo.findBy({ tenantId: this.tenantContext.tenantId });
  }

  findOneOrFail(id: string): Promise<Product> {
    return this.repo.findOneByOrFail({
      id,
      tenantId: this.tenantContext.tenantId,
    });
  }
}
```

## Entity with tenantId

```typescript
@Entity('products')
export class Product extends BaseEntity {
  @Column()
  tenantId: string;

  @Column()
  name: string;
}
```
