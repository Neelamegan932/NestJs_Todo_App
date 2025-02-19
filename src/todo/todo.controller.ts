import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { JwtAuthGuard } from 'src/guards/jwtguard';
import { todoDto } from './todo.dto';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}
  @Post()
  @UseGuards(JwtAuthGuard)
  async validateUser(@Req() req, @Body() todoDto: todoDto) {
    const user = req.user;
    const userId = user.id;
    return this.todoService.createTodo(userId, todoDto);
  }

  @Get(':id')
  async getTodo(@Param('id') id: string) {
    return this.todoService.getTodo(id);
  }

  @Get()
  async getAllTodo() {
    return this.todoService.getAllTodo();
  }

  @Put(':id')
  async updateTodoStatus(@Param('id') id: string) {
    return this.todoService.updateTodoStatus(id);
  }

  @Delete(':id')
  async deleteTodo(@Param('id') id: string) {
    return this.todoService.deleteTodo(id);
  }
}
