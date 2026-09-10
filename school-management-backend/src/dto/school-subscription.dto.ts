import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PLATFORM_BILLING_PERIODS } from '../platform-billing/platform-billing.types';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null || value === undefined ? undefined : value;

/** Strip RTL/zero-width marks that break @IsEmail when pasted from Arabic keyboards. */
const normalizeEmail = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .trim()
    .toLowerCase();
};

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class SendSignupEmailOtpDto {
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(255)
  email: string;
}

export class VerifySignupEmailOtpDto {
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be a 6-digit OTP' })
  code: string;
}

export class SchoolSubscriptionInquiryDto {
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  school_name: string;

  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(255)
  email: string;

  @Transform(trimString)
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  phone: string;

  @IsIn(['small', 'mid', 'large'])
  scope: 'small' | 'mid' | 'large';

  @IsOptional()
  @IsIn(['en', 'ar'])
  locale?: 'en' | 'ar';
}

export class CustomPlanRequestDto {
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  school_name: string;

  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(255)
  email: string;

  @Transform(trimString)
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  phone: string;

  @IsIn(['small', 'mid', 'large'])
  scope: 'small' | 'mid' | 'large';

  @IsOptional()
  @IsIn(['en', 'ar'])
  locale?: 'en' | 'ar';

  /** Optional module codes from the public catalog. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(64)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  module_codes?: string[];

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateCustomPlanRequestDto {
  @IsOptional()
  @IsIn(['new', 'contacted', 'closed'])
  status?: 'new' | 'contacted' | 'closed';

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(2000)
  admin_notes?: string | null;
}

export class SchoolSubscriptionRegisterDto {
  @IsEmail()
  @MaxLength(255)
  owner_email: string;

  /** One-time token from POST .../email-otp/verify (proves owner email). */
  @IsString()
  @MinLength(20)
  @MaxLength(128)
  email_verification_token: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  owner_first_name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  owner_last_name: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  owner_phone: string;

  /** As printed on CR / authorisation (optional; defaults to first + last name). */
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  owner_legal_name?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  school_name: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  school_address?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(30)
  school_phone: string;

  @IsEmail()
  school_email: string;

  /** Platform SaaS plan (essential | standard | complete). */
  @IsString()
  @MaxLength(64)
  plan_code: string;

  @IsIn([...PLATFORM_BILLING_PERIODS])
  billing_period: (typeof PLATFORM_BILLING_PERIODS)[number];
}
