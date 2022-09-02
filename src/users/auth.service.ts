import { UsersService } from './users.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { encryptPassword, decryptPassword } from '../utils/passwordHash';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    //see if user is in use
    const users = await this.userService.find(email);
    if (users.length) {
      throw new BadRequestException('email is use..');
    }
    // encrypt password
    const encryptedPassword = await encryptPassword(password);
    //create a new user and save
    const user = await this.userService.create(email, encryptedPassword);
    //return the user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.find(email);
    if (!user) {
      throw new NotFoundException('user not found..');
    }
    //decrypt password
    const isValidPassword = await decryptPassword(password, user.password);
    if (!isValidPassword) {
      throw new BadRequestException('bad password.');
    }
    return user;
  }
}
