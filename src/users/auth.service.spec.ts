import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('auth service', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUserService = {
      find: (email: string) => {
        const filterdUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filterdUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99),
          email,
          password,
        };
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted & hashed pwd', async () => {
    const user = await service.signup('arpited9@gmail.com', '12345');
    expect(user.password).not.toEqual('12345');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs w duplicate email', async () => {
    fakeUserService.find = () =>
      Promise.resolve([
        {
          id: 1,
          email: 'arpited7@gmail.com',
          password: 'abcdef',
        },
      ]);
    try {
      await service.signup('arpited7@gmail.com', '123');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err).toHaveProperty('message', 'email is use..');
    }
  });

  it('throws if sign in is called with unsued email', async () => {
    try {
      await service.signin('abcd@xyz.com', 'kwokd');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err).toHaveProperty('message', 'user not found..');
    }
  });

  it('throws if an invalid pwd is provided', async () => {
    fakeUserService.find = () =>
      Promise.resolve([
        {
          id: 1,
          email: 'arpited7@gmail.com',
          password: 'abcdef',
        },
      ]);
    try {
      await service.signin('abcd@xyz.com', 'kwokd');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err).toHaveProperty('message', 'bad password.');
    }
  });

  it('returns user for correct pwd', async () => {
 
    await service.signup('aokoa@koaa.com', 'plsps');

    const user = await service.signin('aokoa@koaa.com', 'plsps');
    expect(user).toBeDefined();
  });
});
