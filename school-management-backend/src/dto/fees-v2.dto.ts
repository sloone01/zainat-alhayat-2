import { Transform, Type } from 'class-transformer';
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

export class FeePackageChargeStructureInput {
  @IsUUID()
  charge_type_id: string;

  @IsIn(['upfront', 'installment'])
  payment_timing: 'upfront' | 'installment';

  @IsIn(['per_year', 'once_only'])
  billing_frequency: 'per_year' | 'once_only';
}

export class UpsertFeePackageStructureDto {
  @IsOptional()
  @IsUUID()
  school_id: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeePackageChargeStructureInput)
  charge_lines: FeePackageChargeStructureInput[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  discount_type_ids?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  extra_type_ids?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  inclusion_type_ids?: string[];
}

export class InstallmentPlanEntryInput {
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

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;
}

export class UpsertInstallmentPlanDto {
  @IsOptional()
  @IsUUID()
  school_id: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstallmentPlanEntryInput)
  entries: InstallmentPlanEntryInput[];
}

export class GradeFeeLinkLineInput {
  @IsUUID()
  charge_type_id: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class UpsertGradeFeeLinkDto {
  @IsOptional()
  @IsUUID()
  school_id: string;

  @IsUUID()
  level_id: string;

  @IsUUID()
  fee_package_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeFeeLinkLineInput)
  lines: GradeFeeLinkLineInput[];
}

export class UpsertBusFeeLinkDto {
  @IsOptional()
  @IsUUID()
  school_id: string;

  @IsUUID()
  bus_id: string;

  @IsUUID()
  fee_package_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeFeeLinkLineInput)
  lines: GradeFeeLinkLineInput[];
}

export class AssignStudentChargePlanDto {
  @IsOptional()
  @IsUUID()
  installment_plan_id?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChargeSheetDiscountInput)
  discounts?: ChargeSheetDiscountInput[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChargeSheetExtraInput)
  extras?: ChargeSheetExtraInput[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChargeSheetInclusionInput)
  inclusions?: ChargeSheetInclusionInput[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  upfront_due?: number;
}

export class UpsertCourseFeeLinkDto {
  @IsOptional()
  @IsUUID()
  school_id: string;

  @IsUUID()
  course_id: string;

  @IsUUID()
  fee_package_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeFeeLinkLineInput)
  lines: GradeFeeLinkLineInput[];
}

export class ChargeSheetExtraInput {
  @IsUUID()
  extra_type_id: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

export class ChargeSheetInclusionInput {
  @IsUUID()
  inclusion_type_id: string;
}

export class ChargeSheetDiscountInput {
  @IsUUID()
  discount_type_id: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

export class SetChargeSheetDiscountsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChargeSheetDiscountInput)
  discounts: ChargeSheetDiscountInput[];
}

export class RecordChargePaymentDto {
  @IsNumber()
  @Min(0.001)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

export class SubmitOfflinePaymentDto {
  @IsOptional()
  @IsIn(['upfront', 'installment'])
  target_type?: 'upfront' | 'installment';

  @IsOptional()
  @IsUUID()
  installment_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;

  @IsOptional()
  @IsIn(['en', 'ar'])
  locale?: 'en' | 'ar';

  @IsOptional()
  @IsString()
  allocations?: string;

  @IsOptional()
  @Transform(({ value }) => (value == null || value === '' ? undefined : String(value)))
  @IsIn(['0', '1'])
  use_allocations?: string;
}

export class CreateThawaniSessionDto {
  @IsIn(['upfront', 'installment'])
  target_type: 'upfront' | 'installment';

  @IsOptional()
  @IsUUID()
  installment_id?: string;

  @IsString()
  success_url: string;

  @IsString()
  cancel_url: string;

  @IsOptional()
  @IsIn(['en', 'ar'])
  locale?: 'en' | 'ar';
}

export class ReviewFeePaymentDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CreateFeeTransferDto {
  @IsOptional()
  @IsUUID()
  school_id: string;

  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return trimmed.split(',').map((id) => id.trim()).filter(Boolean);
    }
  })
  @IsArray()
  @IsUUID('4', { each: true })
  payment_ids: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  /** YYYY-MM-DD bank transfer date */
  @IsOptional()
  @IsString()
  @MaxLength(10)
  transferred_at?: string;

  /** Bank transfer amount; defaults to sum of selected payments when omitted */
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  amount?: number;
}
