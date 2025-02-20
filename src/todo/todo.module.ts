import { Module } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { Todo } from 'src/entities/todo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [TypeOrmModule.forFeature([Todo]), PassportModule],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
