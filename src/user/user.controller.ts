import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Search,
} from '@nestjs/common';
import { UserService } from './user.service';
import { updateUserDto, UserDto } from './user.dto';
import { LoginUserDto } from './user.login.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() userDto: UserDto) {
    return this.userService.createNewUser(userDto);
  }

  @Get()
  getUsers(@Query('searchQuery') searchQuery?: string) {
    return this.userService.getAllUsers(searchQuery);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.getOneUser(id);
  }

  @Get('todos/:id')
  getAllTodos(@Param('id') id: string) {
    return this.userService.getOneUserTodos(id);
  }

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() updateDto: updateUserDto) {
    return this.userService.updateUser(id, updateDto);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return {
      Details: this.userService.deleteUser(id),
      message: 'User deleted successfully',
    };
  }
}
