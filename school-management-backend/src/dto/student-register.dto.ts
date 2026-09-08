import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class RegisterStudentParentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  existingParentId?: number;

  @IsOptional()
  @IsBoolean()
  createNew?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  createUser?: boolean;

  @IsOptional()
  @IsIn(['father', 'mother', 'guardian'])
  relationship?: 'father' | 'mother' | 'guardian';
}

export class RegisterStudentInAppDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  secondName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  thirdName?: string;

  @IsDateString()
  dateOfBirth: string;

  @IsIn(['male', 'female'])
  gender: 'male' | 'female';

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  medicalInfo?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  studentId?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsUUID()
  groupId: string;

  @IsOptional()
  @IsBoolean()
  createStudentUser?: boolean;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  studentEmail?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RegisterStudentParentDto)
  parent?: RegisterStudentParentDto;
}
