import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PLATFORM_BILLING_PERIODS } from '../platform-billing/platform-billing.types';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null || value === undefined ? undefined : value;

export class SchoolSubscriptionRegisterDto {
  @IsEmail()
  @MaxLength(255)
  owner_email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

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
