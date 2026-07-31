import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ArrayUnique,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PLATFORM_BILLING_PERIODS } from '../platform-billing.types';

export class UpsertSchoolSubscriptionDto {
  @IsString()
  @MaxLength(64)
  plan_code: string;

  @IsIn([...PLATFORM_BILLING_PERIODS])
  billing_period: (typeof PLATFORM_BILLING_PERIODS)[number];

  @IsOptional()
  @IsDateString()
  period_start?: string;

  @IsOptional()
  @IsDateString()
  period_end?: string;

  @IsOptional()
  @IsIn(['draft', 'active', 'past_due', 'cancelled'])
  status?: 'draft' | 'active' | 'past_due' | 'cancelled';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  included_student_seats_override?: number | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  addon_codes?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;

  /** When true, also set school.status to active (after payment approval). */
  @IsOptional()
  @IsBoolean()
  activate_school?: boolean;

  @IsOptional()
  @IsIn(['pending', 'active', 'suspended', 'rejected'])
  school_status?: 'pending' | 'active' | 'suspended' | 'rejected';
}

export class MarkInvoicePaidDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  paid_note?: string;

  /** When true (default), set subscription active and school active. */
  @IsOptional()
  @IsBoolean()
  activate_school?: boolean;
}

export class IssueInvoiceDto {
  @IsOptional()
  @IsDateString()
  period_start?: string;

  @IsOptional()
  @IsDateString()
  period_end?: string;
}
