import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsArray,
  ArrayMinSize,
  MinLength,
  IsNumber,
  IsUUID,
  ValidateNested,
  ValidateIf,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/** Download path from AttachmentService — never a base64 data URL. */
const ATTACHMENT_DOWNLOAD =
  /^\/api\/attachments\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/download$/i;

/** Treat blank strings as missing so @IsOptional() skips format validators (e.g. email). */
const emptyToUndefined = () =>
  Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    if (typeof value === 'string' && value.trim() === '') return undefined;
    return value;
  });

/** Keep phone/id values as strings (implicit conversion turns numeric strings into numbers). */
const asString = () =>
  Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return String(value).trim();
  });

const hasText = (value: unknown): boolean =>
  value !== undefined && value !== null && String(value).trim().length > 0;

const hasPersonName = (person?: {
  fullName?: string;
  first_name_ar?: string;
  last_name_ar?: string;
  first_name_en?: string;
  last_name_en?: string;
}): boolean =>
  hasText(person?.fullName) ||
  (hasText(person?.first_name_ar) &&
    hasText(person?.first_name_en) &&
    hasText(person?.last_name_ar) &&
    hasText(person?.last_name_en));

@ValidatorConstraint({ name: 'guardianPrimaryContact', async: false })
class GuardianPrimaryContactConstraint implements ValidatorConstraintInterface {
  validate(guardian: GuardianInfoDto): boolean {
    if (!guardian?.type) return false;

    const emergency = guardian.emergencyContact;
    if (
      !hasText(emergency?.fullName) ||
      !hasText(emergency?.mobile) ||
      !hasText(emergency?.relationship)
    ) {
      return false;
    }

    if (guardian.type === 'father') {
      const f = guardian.fatherInfo;
      return hasPersonName(f) && hasText(f?.mobile) && hasText(f?.email);
    }
    if (guardian.type === 'mother') {
      const m = guardian.motherInfo;
      return hasPersonName(m) && hasText(m?.mobile) && hasText(m?.email);
    }
    if (guardian.type === 'other') {
      const o = guardian.otherInfo;
      return (
        hasText(o?.organizationName) &&
        hasText(o?.phone) &&
        hasText(o?.responsiblePerson) &&
        hasText(o?.responsiblePhone)
      );
    }
    return false;
  }

  defaultMessage(): string {
    return 'Primary guardian (including email) and emergency contact details are incomplete';
  }
}

export class StudentDetailsDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  first_name_ar?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  first_name_en?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  last_name_ar?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  last_name_en?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  secondName?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  thirdName?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  secondNameEn?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  thirdNameEn?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  tribe?: string;

  @asString()
  @IsString()
  idNumber: string;

  @IsEnum(['male', 'female'])
  gender: 'male' | 'female';

  @IsString()
  nationality: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  religion?: string;

  @IsDateString()
  dateOfBirth: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsBoolean()
  hasSiblings?: boolean;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  @Matches(ATTACHMENT_DOWNLOAD, {
    message: 'Student photo must be uploaded via the attachment service',
  })
  photo?: string;
}

export class AcademicInfoDto {
  @IsEnum(['new', 'transfer'])
  enrollmentStatus: 'new' | 'transfer';

  @IsString()
  gradeLevel: string;

  @ValidateIf((o) => o.enrollmentStatus === 'transfer')
  @IsString()
  previousSchool?: string;
}

export class HealthInfoDto {
  @IsOptional()
  @IsBoolean()
  allergies?: boolean;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  allergiesDetails?: string;

  @IsOptional()
  @IsBoolean()
  seizures?: boolean;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  seizuresDetails?: string;

  @IsOptional()
  @IsBoolean()
  surgeries?: boolean;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  surgeriesDetails?: string;

  @IsOptional()
  @IsBoolean()
  chronicDiseases?: boolean;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  chronicDiseasesDetails?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  other?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalReports?: string[];
}

export class FatherInfoDto {
  @IsOptional()
  @emptyToUndefined()
  @IsString()
  fullName?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  first_name_ar?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  first_name_en?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  last_name_ar?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  last_name_en?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  civil_id?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  tribe?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  workplace?: string;

  @IsOptional()
  @asString()
  @IsString()
  workPhone?: string;

  @IsOptional()
  @asString()
  @IsString()
  mobile?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsEmail()
  email?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  maritalStatus?: string;
}

export class MotherInfoDto {
  @IsOptional()
  @emptyToUndefined()
  @IsString()
  fullName?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  first_name_ar?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  first_name_en?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  last_name_ar?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  last_name_en?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  civil_id?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  tribe?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  workplace?: string;

  @IsOptional()
  @asString()
  @IsString()
  workPhone?: string;

  @IsOptional()
  @asString()
  @IsString()
  mobile?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsEmail()
  email?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  maritalStatus?: string;
}

export class OtherGuardianDto {
  @IsOptional()
  @emptyToUndefined()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @asString()
  @IsString()
  phone?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  responsiblePerson?: string;

  @IsOptional()
  @asString()
  @IsString()
  responsiblePhone?: string;
}

export class EmergencyContactDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  tribe?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  workplace?: string;

  @IsOptional()
  @asString()
  @IsString()
  workPhone?: string;

  @asString()
  @IsString()
  mobile: string;

  @IsString()
  relationship: string;
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

  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact: EmergencyContactDto;
}

export class AddressInfoDto {
  @IsString()
  area: string;

  @IsString()
  village: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  landmark?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  streetNumber?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  alleyNumber?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  buildingNumber?: string;

  @IsEnum(['house', 'apartment'])
  housingType: 'house' | 'apartment';
}

export class EnrollmentDocumentsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Matches(ATTACHMENT_DOWNLOAD, {
    each: true,
    message: 'Documents must be uploaded via the attachment service',
  })
  parentIdDocuments: string[];

  @IsString()
  @Matches(ATTACHMENT_DOWNLOAD, {
    message: 'Birth certificate must be uploaded via the attachment service',
  })
  birthCertificate: string;

  @IsString()
  @Matches(ATTACHMENT_DOWNLOAD, {
    message: 'Child ID document must be uploaded via the attachment service',
  })
  childIdDocument: string;
}

export class CreateEnrollmentDto {
  /** Schools use UUID primary keys (legacy numeric school_id is rejected). */
  @asString()
  @IsUUID('4')
  school_id: string;

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
  @Validate(GuardianPrimaryContactConstraint)
  guardian: GuardianInfoDto;

  @ValidateNested()
  @Type(() => AddressInfoDto)
  address: AddressInfoDto;

  @ValidateNested()
  @Type(() => EnrollmentDocumentsDto)
  documents: EnrollmentDocumentsDto;

  @IsOptional()
  @emptyToUndefined()
  @IsUUID('4')
  installment_plan_id?: string;
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
  @ValidateNested()
  @Type(() => EnrollmentDocumentsDto)
  documents?: EnrollmentDocumentsDto;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null && v !== undefined && v !== '')
  @IsUUID('4')
  installment_plan_id?: string | null;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'enrolled'])
  status?: 'pending' | 'approved' | 'rejected' | 'enrolled';

  @IsOptional()
  @emptyToUndefined()
  @IsString()
  notes?: string;
}

/** Public wizard: save progress after each step (upsert by school + civil ID). */
export class SavePublicEnrollmentDraftDto {
  @IsUUID('4')
  school_id: string;

  @asString()
  @IsString()
  @MinLength(4)
  civil_id: string;

  @IsOptional()
  @IsUUID('4')
  draftEnrollmentId?: string;

  /** Full wizard snapshot (student / academic / health / …). */
  @IsOptional()
  payload?: Record<string, unknown>;
}
