# Rule: Code Style

## Why It Matters
Consistent style reduces cognitive overhead during reviews and prevents entire classes of runtime bugs (`any` types, missing return types).

## Rules

- **No `any`** — use `unknown` and narrow types explicitly.
- All public service methods must have explicit return types.
- Use barrel files (`index.ts`) per folder to clean up imports.
- Follow NestJS naming conventions strictly.
- Max file length: **300 lines** — split larger files.
- Prefer `readonly` on injected dependencies.

## Naming Conventions

| File type | Pattern |
|-----------|---------|
| Module | `*.module.ts` |
| Controller | `*.controller.ts` |
| Service | `*.service.ts` |
| DTO | `*.dto.ts` |
| Entity | `*.entity.ts` |
| Guard | `*.guard.ts` |
| Interceptor | `*.interceptor.ts` |
| Filter | `*.filter.ts` |
| Pipe | `*.pipe.ts` |
| Decorator | `*.decorator.ts` |

## No `any`

```typescript
// ❌ Bad
async processPayload(data: any): Promise<any> { ... }

// ✅ Good
async processPayload(data: unknown): Promise<ProcessedResult> {
  if (!isValidPayload(data)) throw new BadRequestException('Invalid payload');
  // data is now narrowed
}
```

## Readonly Dependencies

```typescript
// ✅
constructor(
  private readonly usersService: UsersService,
  private readonly configService: ConfigService,
) {}
```

## Barrel File

```typescript
// modules/users/index.ts
export { UsersModule } from './users.module';
export { UsersService } from './users.service';
export { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
```

## ESLint Rules to Enforce

```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/explicit-function-return-type": ["error", { "allowExpressions": true }],
  "@typescript-eslint/no-floating-promises": "error"
}
```
