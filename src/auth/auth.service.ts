import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { LoginUserDto } from 'src/user/user.login.dto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    if (!email) {
      throw new BadRequestException('email Required');
    }
    if (!password) {
      throw new BadRequestException('password required');
    }

    const user = await this.userRepo.findOne({ where: { email: email } });
    if (!user) {
      throw new BadRequestException('user not found');
    }

    const passwordIsMatch = await bcrypt.compare(password, user.password);
    if (!passwordIsMatch) {
      throw new BadRequestException('Password Incorrect');
    }

    const payload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isDeleted: user.isDeleted,
    };
    const token = await this.jwtService.sign(payload);
    return {
      code: 'success',
      access_token: token,
      message: 'login successfull',
    };
  }
}
