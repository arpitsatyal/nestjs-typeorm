import { User } from './user.entity';
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
  Request,
  NotFoundException,
  Session,
  BadRequestException,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user-dto';
import { UpdateUserDTO } from './dtos/update-user-dto';
import { UsersService } from './users.service';
import { UserDTO } from './dtos/user.dto';
import { Serialize } from '../interceptors/serealize.interceptor';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGaurd } from '../guards/auth.gaurd';

@Controller('auth')
@Serialize(UserDTO)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('isAuthorized')
  async isAuthorized(@Session() session: any) {
    const user = await this.userService.findOne(session.userId);
    if (!user) throw new BadRequestException('not authorized');
    return user;
  }

  @Get('whoami')
  async whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Get('whoami2')
  async whoAmI2(@Request() request: any) {
    if (!request.CurrentUser) {
      throw new ForbiddenException('you are not logged in brother.');
    }
    return request.CurrentUser;
  }

  @Post('/signup')
  async createUser(@Body() body: CreateUserDTO, @Session() session: any) {
    const user = await this.authService.signup(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/signin')
  async signin(@Body() body: CreateUserDTO, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/signout')
  async signOut(@Session() session: any) {
    session.userId = null;
  }

  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    if (!user) {
      throw new NotFoundException('user not found!');
    }
    return user;
  }

  @Get()
  @UseGuards(AuthGaurd)
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
