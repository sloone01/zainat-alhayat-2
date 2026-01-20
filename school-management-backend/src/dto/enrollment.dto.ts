import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsDateString, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StudentDetailsDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  tribe?: string;

  @IsOptional()
  @IsString()
  idNumber?: string;

  @IsEnum(['male', 'female'])
  gender: 'male' | 'female';

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  religion?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsBoolean()
  hasSiblings?: boolean;

  @IsOptional()
  @IsString()
  photo?: string;
}

export class AcademicInfoDto {
  @IsEnum(['new', 'transfer'])
  enrollmentStatus: 'new' | 'transfer';

  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @IsOptional()
  @IsString()
  previousSchool?: string;
}

export class HealthInfoDto {
  @IsOptional()
  @IsBoolean()
  allergies?: boolean;

  @IsOptional()
  @IsString()
  allergiesDetails?: string;

  @IsOptional()
  @IsBoolean()
  seizures?: boolean;

  @IsOptional()
  @IsString()
  seizuresDetails?: string;

  @IsOptional()
  @IsBoolean()
  surgeries?: boolean;

  @IsOptional()
  @IsString()
  surgeriesDetails?: string;

  @IsOptional()
  @IsBoolean()
  chronicDiseases?: boolean;

  @IsOptional()
  @IsString()
  chronicDiseasesDetails?: string;

  @IsOptional()
  @IsString()
  other?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalReports?: string[];
}

export class FatherInfoDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  tribe?: string;

  @IsOptional()
  @IsString()
  workplace?: string;

  @IsOptional()
  @IsString()
  workPhone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  maritalStatus?: string;
}

export class MotherInfoDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  tribe?: string;

  @IsOptional()
  @IsString()
  workplace?: string;

  @IsOptional()
  @IsString()
  workPhone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  maritalStatus?: string;
}

export class OtherGuardianDto {
  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  responsiblePerson?: string;

  @IsOptional()
  @IsString()
  responsiblePhone?: string;
}

export class EmergencyContactDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  tribe?: string;

  @IsOptional()
  @IsString()
  workplace?: string;

  @IsOptional()
  @IsString()
  workPhone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  relationship?: string;
}

export class GuardianInfoDto {
  @IsEnum(['father', 'mother', 'other'])
  type: 'father' | 'mother' | 'other';

  @IsOptional()
  @ValidateNested()
  @Type(() => FatherInfoDto)
  fatherInfo?: FatherInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MotherInfoDto)
  motherInfo?: MotherInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OtherGuardianDto)
  otherInfo?: OtherGuardianDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;
}

export class AddressInfoDto {
  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  village?: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsString()
  streetNumber?: string;

  @IsOptional()
  @IsString()
  alleyNumber?: string;

  @IsOptional()
  @IsString()
  buildingNumber?: string;

  @IsEnum(['house', 'apartment'])
  housingType: 'house' | 'apartment';
}

export class CreateEnrollmentDto {
  @ValidateNested()
  @Type(() => StudentDetailsDto)
  student: StudentDetailsDto;

  @ValidateNested()
  @Type(() => AcademicInfoDto)
  academic: AcademicInfoDto;

  @ValidateNested()
  @Type(() => HealthInfoDto)
  health: HealthInfoDto;

  @ValidateNested()
  @Type(() => GuardianInfoDto)
  guardian: GuardianInfoDto;

  @ValidateNested()
  @Type(() => AddressInfoDto)
  address: AddressInfoDto;
}

export class UpdateEnrollmentDto {
  @IsOptional()
  student?: Partial<StudentDetailsDto>;

  @IsOptional()
  academic?: Partial<AcademicInfoDto>;

  @IsOptional()
  health?: Partial<HealthInfoDto>;

  @IsOptional()
  guardian?: Partial<GuardianInfoDto>;

  @IsOptional()
  address?: Partial<AddressInfoDto>;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'enrolled'])
  status?: 'pending' | 'approved' | 'rejected' | 'enrolled';

  @IsOptional()
  @IsString()
  notes?: string;
}