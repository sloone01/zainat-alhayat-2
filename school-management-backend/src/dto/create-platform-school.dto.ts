import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PLATFORM_BILLING_PERIODS } from '../platform-billing/platform-billing.types';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null || value === undefined ? undefined : value;

const toBoolean = ({ value }: { value: unknown }) => {
  if (value === true || value === 'true' || value === '1' || value === 1) return true;
  if (value === false || value === 'false' || value === '0' || value === 0) return false;
  return value;
};

/** Platform admin creates a school (no public email OTP). */
export class CreatePlatformSchoolDto {
  @IsEmail()
  @MaxLength(255)
  owner_email: string;

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

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  owner_legal_name?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  school_name_ar: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  school_name_en: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  school_name?: string;

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

  @IsString()
  @MaxLength(64)
  plan_code: string;

  @IsIn([...PLATFORM_BILLING_PERIODS])
  billing_period: (typeof PLATFORM_BILLING_PERIODS)[number];

  /**
   * When true, leave the school pending (no activation, no owner email).
   * When false/omitted, submit activates immediately and requires payment receipt fields.
   */
  @Transform(toBoolean)
  @IsOptional()
  @IsBoolean()
  save_as_draft?: boolean;

  /** Amount received (OMR). Required when submitting (not draft). */
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  paid_amount?: number;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  paid_note?: string;
}
