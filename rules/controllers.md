# Rule: Controllers

## Why It Matters
Controllers that contain business logic or DB calls are hard to test and violate single responsibility.

## Rules

- Controllers handle **HTTP only** — no business logic, no DB calls.
- Always version routes: `@Controller({ path: 'users', version: '1' })`.
- Apply `@UseGuards`, `@UseInterceptors`, `@UsePipes` at the class level for DRY setup.
- Return Response DTOs, never raw entities.
- Use built-in pipes (`ParseUUIDPipe`, `ParseIntPipe`) for param validation.

## Good

```typescript
@Controller({ path: 'users', version: '1' })
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.findOneOrFail(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }
}
```

## Bad

```typescript
// ❌ Business logic in controller
@Get(':id')
async findOne(@Param('id') id: string) {
  const user = await this.userRepo.findOneBy({ id }); // DB call in controller
  if (!user) throw new NotFoundException();
  user.password = undefined; // manual field stripping
  return user; // raw entity returned
}
```
