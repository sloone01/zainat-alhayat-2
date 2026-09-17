import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum, IsNumber, IsUUID, IsIn, ValidateIf } from 'class-validator';

export class LoginDto {
  /** Email or mobile. Prefer this over `email`. */
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  login?: string;

  /** Alias for `login` (older clients). */
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  email?: string;

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

  @IsEnum(['teacher', 'student', 'parent'])
  user_type: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsNumber()
  school_id: string;
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
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  login?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  email?: string;
}

/** Switch to a staff school (`school_id`) or back to parent portal (`persona: parent`). */
export class SwitchSchoolDto {
  @ValidateIf((o: SwitchSchoolDto) => o.persona !== 'parent')
  @IsUUID()
  school_id?: string;

  @IsOptional()
  @IsIn(['parent'])
  persona?: 'parent';
}
