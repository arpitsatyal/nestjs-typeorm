import { AuthService } from './auth.service';
import {
  Controller,
  Post,
  Body,
  Patch,
  Delete,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user-dto';
import { UpdateUserDTO } from './dtos/update-user-dto';
import { UsersService } from './users.service';
import { UserDTO } from './dtos/user.dto';
import { Serialize } from '../interceptors/serealize.interceptor';

@Controller('auth')
@Serialize(UserDTO)
export class UsersController {
  constructor(private userService: UsersService,
    private authService: AuthService
    ) {}

  @Post('/signup')
  createUser(@Body() body: CreateUserDTO) {
    return this.authService.signup(body.email, body.password);
  }

  @Post('/signin')
  signin(@Body() body: CreateUserDTO) {
    return this.authService.signin(body.email, body.password);
  }

  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    if(!user) {
      throw new NotFoundException('user not found!');
    }
    return user;
  }

  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.userService.find(email);
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDTO) {
    return this.userService.update(+id, body);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
