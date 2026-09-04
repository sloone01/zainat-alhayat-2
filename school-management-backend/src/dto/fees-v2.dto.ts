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

export class FeePackageChargeStructureInput {
  @IsUUID()
  charge_type_id: string;

  @IsIn(['upfront', 'installment'])
  payment_timing: 'upfront' | 'installment';

  @IsIn(['per_year', 'once_only'])
  billing_frequency: 'per_year' | 'once_only';
}

export class UpsertFeePackageStructureDto {
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
  @IsInt()
  school_id: number;

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
  @IsInt()
  school_id: number;

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
  @IsInt()
  school_id: number;

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
}

export class UpsertCourseFeeLinkDto {
  @IsInt()
  school_id: number;

  @IsUUID()
  course_id: string;

  @IsUUID()
  fee_package_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeFeeLinkLineInput)
  lines: GradeFeeLinkLineInput[];
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
