import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  first_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  family_name: string;

  @IsEnum(['admin', 'teacher', 'student', 'parent'])
  user_type: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsNumber()
  school_id: number;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;
}

