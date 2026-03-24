# Rule: OpenAPI / Swagger

## Why It Matters
API documentation that drifts from code is worse than no documentation. OpenAPI integration auto-generates accurate, live docs.

## Rules

- Use `@nestjs/swagger` with the CLI plugin to auto-infer DTO properties from TypeScript types.
- Use `DocumentBuilder` to set title, description, version, tags, and auth schemes.
- Disable Swagger UI in production or protect it behind auth middleware.
- Use `@ApiTags()` on controllers, `@ApiOperation()` on methods, `@ApiResponse()` for each status code.
- Use `@ApiProperty()` on DTOs with `type`, `description`, `example`.
- Use `@ApiExcludeEndpoint()` to hide internal endpoints.

## Setup

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('My API')
  .setDescription('API documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);

if (process.env.NODE_ENV !== 'production') {
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
```

## CLI Plugin (nest-cli.json)

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": true,
          "introspectComments": true
        }
      }
    ]
  }
}
```

## Controller Decorators

```typescript
@ApiTags('users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
export class UsersController {
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.findOneOrFail(id);
  }
}
```
