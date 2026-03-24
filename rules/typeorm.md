# Rule: TypeORM / Database

## Why It Matters
Using `synchronize: true` in production can silently destroy data. Missing transactions cause partial writes on failure.

## Rules

- Use **migrations** — never `synchronize: true` in production.
- Define a shared `BaseEntity` for `id`, `createdAt`, `updatedAt`.
- Use `Repository<T>` pattern; avoid raw `EntityManager` in services.
- Wrap multi-step DB operations in a **transaction**.
- Use UUID primary keys (`PrimaryGeneratedColumn('uuid')`).

## Base Entity

```typescript
// database/base.entity.ts
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## Feature Entity

```typescript
@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name?: string;
}
```

## Transaction Example

```typescript
async transferFunds(fromId: string, toId: string, amount: number): Promise<void> {
  await this.dataSource.transaction(async (manager) => {
    const from = await manager.findOneByOrFail(Account, { id: fromId });
    const to = await manager.findOneByOrFail(Account, { id: toId });
    from.balance -= amount;
    to.balance += amount;
    await manager.save([from, to]);
  });
}
```

## Migration Generation

```bash
npx typeorm migration:generate src/database/migrations/AddUserName -d src/data-source.ts
npx typeorm migration:run -d src/data-source.ts
```
