import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class FeePackageLevelAmountInput {
  @IsUUID()
  level_id: string;

  @IsUUID()
  charge_type_id: string;

  @IsIn(['monthly', 'semester', 'yearly'])
  billing_period: 'monthly' | 'semester' | 'yearly';

  @IsNumber()
  @Min(0)
  amount: number;
}

export class FeePackageLevelPeriodSettingInput {
  @IsUUID()
  level_id: string;

  @IsIn(['monthly', 'semester', 'yearly'])
  billing_period: 'monthly' | 'semester' | 'yearly';

  @IsNumber()
  @Min(0)
  downpayment_amount: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  installment_schedule_months?: number[];
}

export class FeePackageCourseAmountInput {
  @IsUUID()
  course_id: string;

  @IsUUID()
  charge_type_id: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class FeePackageInstallmentInput {
  @IsInt()
  @Min(1)
  sequence: number;

  @IsOptional()
  @IsInt()
  month_number?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string | null;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class UpsertFeePackageDto {
  @IsInt()
  school_id: number;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsIn(['one_time', 'installments', 'both'])
  year_payment_mode?: 'one_time' | 'installments' | 'both' | null;

  @IsOptional()
  @IsIn(['grade', 'phase'])
  course_pricing_basis?: 'grade' | 'phase' | null;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  charge_type_ids: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  discount_type_ids?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeePackageInstallmentInput)
  installments?: FeePackageInstallmentInput[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeePackageLevelAmountInput)
  level_amounts: FeePackageLevelAmountInput[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeePackageLevelPeriodSettingInput)
  level_period_settings?: FeePackageLevelPeriodSettingInput[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeePackageCourseAmountInput)
  course_amounts: FeePackageCourseAmountInput[];
}
