import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { updateUserDto, UserDto } from './user.dto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
const fs = require('fs');
const path = require('path');

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
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
    let users = await this.userRepo.find({
      where: searchQuery
        ? [
            { firstName: ILike(`%${searchQuery}%`) },
            { phone: ILike(`%${searchQuery}%`) },
          ]
        : {},
    });
    return { code: 'success', users, total_users_count: users.length };
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

  //Mail sending API

  emailTransport() {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
    return transporter;
  }
  async sendEmail(newUser: any) {
    const recipient = newUser.email;
    const transport = this.emailTransport();
    const htmlFilePath = path.join(
      '/home/neelan/Downloads/nest_todo/src/html_files/email.html',
    );
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
    const options: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: recipient,
      subject: 'Testing email',
      html: htmlContent,
    };
    try {
      (await transport).sendMail(options);
      console.log('email sent successfully');
    } catch (error) {
      console.log('Error sending the mail', error);
      error;
    }
  }
}
