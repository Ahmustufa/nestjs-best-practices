# Rule: Testing

## Why It Matters
Untested services ship silent bugs. Tests without isolation are slow and flaky.

## Rules

- Unit tests: test services in isolation with `Test.createTestingModule()`, mocking all deps.
- E2E tests: use `supertest` against the full app with a test DB (SQLite in-memory or Docker).
- Aim for **≥ 80% coverage** on services and guards.
- Co-locate test files: `users.service.spec.ts` next to `users.service.ts`.
- Never test implementation details — test public behavior.

## Unit Test Template

```typescript
// users/users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    userRepo = module.get(getRepositoryToken(User));
  });

  describe('findOneOrFail', () => {
    it('returns user when found', async () => {
      const user = { id: '1', email: 'a@b.com' } as User;
      userRepo.findOneBy.mockResolvedValue(user);
      await expect(service.findOneOrFail('1')).resolves.toEqual(user);
    });

    it('throws NotFoundException when not found', async () => {
      userRepo.findOneBy.mockResolvedValue(null);
      await expect(service.findOneOrFail('1')).rejects.toThrow(NotFoundException);
    });
  });
});
```

## E2E Test Template

```typescript
// test/users.e2e-spec.ts
describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    applyGlobalConfig(app); // reuse main.ts setup
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /v1/users/:id → 404 when not found', () => {
    return request(app.getHttpServer())
      .get('/v1/users/nonexistent-uuid')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
  });
});
```
