import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEnrollmentResponsibilityDto {
  @IsIn(['school', 'parent'])
  party: 'school' | 'parent';

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text_ar: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text_en: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateEnrollmentResponsibilityDto {
  @IsOptional()
  @IsIn(['school', 'parent'])
  party?: 'school' | 'parent';

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text_ar?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text_en?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
