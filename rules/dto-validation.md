# Rule: DTOs & Validation

## Why It Matters
Without strict validation, malformed or malicious payloads reach business logic. Without response DTOs, sensitive fields leak.

## Global Setup (main.ts)

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,               // strip unknown properties
    forbidNonWhitelisted: true,    // throw on unknown properties
    transform: true,               // auto-transform to DTO instances
    transformOptions: { enableImplicitConversion: true },
  }),
);
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
```

## Rules

- Separate Request DTOs from Response DTOs.
- Use `@Exclude()` on sensitive fields (e.g., `password`) in entities/response DTOs.
- Extend with `PartialType`, `PickType`, `OmitType` — don't repeat decorator declarations.
- Every property must have at least one `class-validator` decorator.

## Request DTOs

```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

## Response DTOs

```typescript
export class UserResponseDto {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  // password is intentionally omitted
}
```

## Entity with Exclusion

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Exclude()
  @Column()
  password: string;
}
```
