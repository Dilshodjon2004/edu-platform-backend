import { IsEmail, IsString } from 'class-validator';

export class RegisterAuthDto {
  @IsString()
  @IsEmail()
  email: string;

  password: string;
}
