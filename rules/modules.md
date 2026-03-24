# Rule: Modules

## Why It Matters
Poorly scoped modules lead to tight coupling, circular dependencies, and bloated startup times.

## Rules

- Use `@Global()` only for truly app-wide providers (logging, config, DB connection).
- Always use `ConfigModule.forRoot({ isGlobal: true, validationSchema })` at the app root.
- Lazy-load heavy modules with dynamic imports where startup time matters.
- Always define `exports` for anything other modules need.

## Good

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
```

## App Root Module

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envSchema }),
    DatabaseModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
```
