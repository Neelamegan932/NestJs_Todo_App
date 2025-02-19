import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsEmail, IsNumber, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsNumber()
  phone: string;
}

export class updateUserDto extends PartialType(UserDto) {}
