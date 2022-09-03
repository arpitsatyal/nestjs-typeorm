import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUserService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUserService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: '',
          password: '',
        });
      },
      find: (email: string) => {
        return Promise.resolve([
          {
            id: 1,
            email,
            password: '',
          },
        ]);
      },
    };
    fakeAuthService = {
      signin: (email: string, password: string) => {
        return Promise.resolve({
          id: 1,
          email,
          password,
        });
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns all users..', async () => {
    const users = await controller.findAllUsers('s@s.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('s@s.com');
  });

  it('findUser returns a user..', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error when id not found.', async () => {
    fakeUserService.findOne = () => null;
    try {
      await controller.findUser('1');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err).toHaveProperty('message', 'user not found!');
    }
  });

  it('sign in updates session and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      {
        email: '',
        password: '',
      },
      session,
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
