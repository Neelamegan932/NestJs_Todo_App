import { IsString } from 'class-validator';

export class todoDto {
  @IsString()
  description: string;

  @IsString()
  date: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}
