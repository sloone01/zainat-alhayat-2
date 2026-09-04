import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ArrayUnique,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PLATFORM_BILLING_PERIODS } from '../platform-billing.types';

export class PlatformPlanPriceInputDto {
  @IsIn([...PLATFORM_BILLING_PERIODS])
  billing_period: (typeof PLATFORM_BILLING_PERIODS)[number];

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  amount_omr: number;
}

export class UpdatePlatformPlanDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name_en?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description_en?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description_ar?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  included_student_seats?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  overage_per_student_omr?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  /** Module codes included in this plan. Plan package price = sum of module prices. */
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  module_codes?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlatformPlanPriceInputDto)
  prices?: PlatformPlanPriceInputDto[];
}

export class UpdatePlatformModuleDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name_en?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description_en?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description_ar?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  page_keys?: string[];

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  /** Single module value (OMR). */
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  amount_omr?: number;
}

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
