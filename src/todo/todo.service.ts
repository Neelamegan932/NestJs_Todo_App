import { BadRequestException, Injectable } from '@nestjs/common';
import { todoDto } from './todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from 'src/entities/todo.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Status } from 'src/enums/status.enum';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepo: Repository<Todo>,
  ) {}
  async createTodo(userId: string, todoDto: todoDto) {
    const { date, startTime, endTime } = todoDto;
    const existingTodo = await this.todoRepo.findOne({
      where: {
        userId: userId,
        date,
        startTime: LessThanOrEqual(endTime),
        endTime: MoreThanOrEqual(startTime),
      },
    });
    if (existingTodo) {
      return {
        message: 'Todo already created for this slot, please choose another',
      };
    }
    const todoUser = await this.todoRepo.create({ ...todoDto, userId });

    await this.todoRepo.save(todoUser);
    return todoUser;
  }

  async getTodo(id: string) {
    let existingTodo = await this.todoRepo.findOne({
      where: { id: id },
      relations: ['user'],
    });
    if (!existingTodo) {
      throw new BadRequestException('Todo not found');
    }
    return { code: 'sucess', todo: existingTodo };
  }

  async getAllTodo() {
    let existingTodos = await this.todoRepo.find();
    if (!existingTodos) {
      throw new BadRequestException('Todos not found');
    }
    return { code: 'success', allTodos: existingTodos };
  }

  async updateTodoStatus(id: string) {
    const currentDate = new Date();
    const existingTodo = await this.todoRepo.findOne({ where: { id } });
    if (!existingTodo) {
      throw new BadRequestException('Todo not found');
    }
    const todoDate = new Date(`${existingTodo.date}T${existingTodo.endTime}`);
    const diffInMs = todoDate.getTime() - currentDate.getTime();
    let diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    console.log('difference in hours', diffInHours);
    if (diffInHours < 0) {
      await this.todoRepo.update(id, { status: Status.EXPIRED });
      return this.todoRepo.findOne({ where: { id } });
    }
    const newStatus = diffInHours > 0 ? Status.NOT_STARTED : Status.COMPLETED;
    await this.todoRepo.update(id, { status: newStatus });
    return this.todoRepo.findOne({ where: { id } });
  }

  async deleteTodo(id: string) {
    let existingTodo = await this.todoRepo.findOne({ where: { id: id } });
    if (!existingTodo) {
      throw new BadRequestException('Todo not found');
    }
    await this.todoRepo.delete({ id });
    return { message: 'todo deleted successfully', details: existingTodo };
  }
}
