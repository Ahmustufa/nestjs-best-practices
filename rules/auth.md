# Rule: Authentication & Authorization

## Why It Matters
Auth bugs are security vulnerabilities. A global-by-default guard ensures routes are protected unless explicitly opted out.

## Rules

- Use `PassportStrategy` with JWT for stateless auth.
- Register `JwtAuthGuard` as a global `APP_GUARD` — all routes protected by default.
- Use a `@Public()` decorator to opt-out specific routes.
- Role/permission checks in a separate `RolesGuard` using `Reflector`.
- Never store raw passwords — always `bcrypt` with cost factor ≥ 12.
- JWT secret must come from `ConfigService`, never hardcoded.

## Global Guard Setup

```typescript
// app.module.ts
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
]
```

## Public Decorator

```typescript
// common/decorators/public.decorator.ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

## JWT Guard

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { super(); }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

## Usage

```typescript
@Public()
@Post('auth/login')
login(@Body() dto: LoginDto) { ... }

@Get('profile')          // protected by default — no decorator needed
getProfile(@CurrentUser() user: User) { ... }
```

## Password Hashing

```typescript
const hash = await bcrypt.hash(password, 12);
const valid = await bcrypt.compare(plain, hash);
```
