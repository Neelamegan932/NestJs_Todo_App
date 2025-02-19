import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/user/user.login.dto';
import { JwtAuthGuard } from 'src/guards/jwtguard';
import { TodoService } from 'src/todo/todo.service';
import { todoDto } from 'src/todo/todo.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async loginUser(@Body() loginDto: LoginUserDto) {
    return await this.authService.login(loginDto);
  }
}
