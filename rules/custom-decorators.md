# Rule: Custom Decorators

## Why It Matters
Custom decorators eliminate repetitive `req.user` access, compose multiple decorators into one, and keep controllers clean and declarative.

## Rules

- Use `createParamDecorator()` to extract request data cleanly instead of manually accessing `req.user`.
- Pass data to decorators for property extraction (e.g., `@User('email')`).
- Use `applyDecorators()` to compose multiple decorators into a single reusable decorator.
- Custom param decorators work with pipes — set `validateCustomDecorators: true` in ValidationPipe if needed.
- Use classes (not interfaces) for DTOs — interfaces are erased at runtime, breaking validation.

## Param Decorator

```typescript
// common/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

// Usage
@Get('profile')
getProfile(@CurrentUser() user: User) { ... }

@Get('email')
getEmail(@CurrentUser('email') email: string) { ... }
```

## Composed Decorator

```typescript
// common/decorators/auth.decorator.ts
export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

// Usage — replaces 4 decorators with 1
@Auth(Role.Admin)
@Get('admin/dashboard')
dashboard() { ... }
```

## Public Decorator

```typescript
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```
