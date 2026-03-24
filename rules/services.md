# Rule: Services

## Why It Matters
Services are the single source of truth for business logic. Scattering logic elsewhere makes testing and maintenance painful.

## Rules

- Services contain **all business logic** and are the only layer that touches repositories.
- Inject dependencies via constructor — never instantiate manually.
- Throw typed `HttpException` subclasses (`NotFoundException`, `BadRequestException`, etc.).
- Use `async/await` — never mix `.then()` chains with `await`.
- All public methods must have explicit return types.
- Use `readonly` on injected dependencies.

## Good

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async findOneOrFail(id: string): Promise<User> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOneBy({ email: dto.email });
    if (existing) throw new ConflictException('Email already in use');
    const hashed = await bcrypt.hash(dto.password, 12);
    return this.userRepo.save(this.userRepo.create({ ...dto, password: hashed }));
  }
}
```

## Bad

```typescript
// ❌ No return type, raw Error, mixing then/await
async findOne(id: string) {
  return this.userRepo.findOneBy({ id }).then(user => {
    if (!user) throw new Error('not found'); // raw Error, no HTTP status
    return user;
  });
}
```
