import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { updateUserDto, UserDto } from './user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async createNewUser(userDto: UserDto) {
    let newUser = await this.userRepo.create(userDto);
    let existingEmail = await this.userRepo.findOne({
      where: { email: newUser.email },
    });
    if (existingEmail) {
      throw new BadRequestException('Email Already Exits');
    }

    let existingPhone = await this.userRepo.findOne({
      where: { phone: newUser.phone },
    });
    if (existingPhone) {
      throw new BadRequestException('Phone Number Already Exits');
    }
    await this.userRepo.save(newUser);
    const { password, ...user } = newUser;
    return { code: 'success', user };
  }

  async getAllUsers(searchQuery?: string) {
    let [users, count] = await this.userRepo.findAndCount({
      where: searchQuery
        ? [
            { firstName: ILike(`%${searchQuery}%`) },
            { phone: ILike(`%${searchQuery}%`) },
          ]
        : {},
    });
    return { code: 'success', users, total_users_count: count };
  }

  async getOneUser(id: string) {
    let existingUser = await this.userRepo.findOne({ where: { id: id } });
    if (!existingUser) {
      throw new BadRequestException('User not found');
    }
    let { password, ...user } = existingUser;
    return { code: 'success', userDetails: user };
  }

  async getOneUserTodos(id: string) {
    let existingUser = await this.userRepo.findOne({
      where: { id: id },
      relations: ['todo'],
    });
    if (!existingUser) {
      throw new BadRequestException('User not found');
    }
    let { password, ...user } = existingUser;
    return {
      code: 'success',
      userDetails: user,
      totalTodos: existingUser.todo.length,
    };
  }

  async updateUser(id: string, updateDto: updateUserDto) {
    await this.userRepo.update(id, updateDto);
    const existingUser = await this.userRepo.findOne({ where: { id: id } });
    if (!existingUser) {
      throw new BadRequestException('User not found');
    }
    const { password, ...user } = existingUser;
    return { code: 'success', updatedUserDetail: user };
  }

  async deleteUser(id: string) {
    return this.userRepo.update(id, {
      firstName: null,
      lastName: null,
      email: null,
      password: null,
      phone: null,
      isDeleted: true,
    });
  }
}
