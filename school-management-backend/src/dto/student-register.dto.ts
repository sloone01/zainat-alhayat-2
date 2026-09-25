import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
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

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  secondNameEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  thirdNameEn?: string;

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
  @MaxLength(100)
  tribe?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  studentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  civil_id?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  /** When set, final submit updates this draft row instead of creating a new student. */
  @IsOptional()
  @IsUUID()
  draftStudentId?: string;

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

/** Step-1 draft from `/students/register` — no group/parent yet. */
export class SaveStudentRegisterDraftDto {
  @IsOptional()
  @IsUUID()
  draftStudentId?: string;

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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  secondNameEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  thirdNameEn?: string;

  @IsDateString()
  dateOfBirth: string;

  @IsIn(['male', 'female'])
  gender: 'male' | 'female';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tribe?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  studentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  civil_id?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  medicalInfo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  emergencyContact?: string;
}

export class SaveStudentRegisterDraftParentItemDto {
  @IsIn(['father', 'mother', 'guardian'])
  relationship: 'father' | 'mother' | 'guardian';

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

  /** Login is created only on final submit, not while drafting. */
  @IsOptional()
  @IsBoolean()
  createUser?: boolean;
}

/** Guardian step: link existing parents or create draft parents on the draft student. */
export class SaveStudentRegisterDraftParentsDto {
  @IsUUID()
  draftStudentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveStudentRegisterDraftParentItemDto)
  parents: SaveStudentRegisterDraftParentItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  emergencyContact?: string;
}
