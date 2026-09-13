import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class RegisterStudentParentDto {
  @IsOptional()
  @IsUUID()
  existingParentId?: string;

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
  @IsString()
  @MaxLength(100)
  first_name_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  first_name_en?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name_en?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  civil_id?: string;

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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tribe?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  workplace?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  workPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  maritalStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  organizationName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  responsiblePerson?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  responsiblePhone?: string;
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
  first_name_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  first_name_en?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name_en?: string;

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
