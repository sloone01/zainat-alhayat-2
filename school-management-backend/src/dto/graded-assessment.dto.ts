import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateGradedCriterionBodyDto {
  @IsOptional()
  @IsString()
  label: string;

  @IsNumber()
  @Min(0)
  max_marks: number;
}

export class CreateGradedSemesterBodyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => CreateGradedCriterionBodyDto)
  criteria: CreateGradedCriterionBodyDto[];
}

export class CreateGradedCourseBodyDto {
  @IsOptional()
  @IsUUID()
  school_id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  academic_year_id?: string;

  @ValidateIf((o: CreateGradedCourseBodyDto) => !o.save_as_draft)
  @IsUUID()
  level_id?: string;

  @IsOptional()
  @IsBoolean()
  save_as_draft?: boolean;

  @IsNumber()
  @Min(0.01)
  total_marks: number;

  @IsIn(['sum', 'average'])
  aggregation_method: 'sum' | 'average';

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => CreateGradedSemesterBodyDto)
  semesters: CreateGradedSemesterBodyDto[];
}

/** PATCH body — same shape as create except `school_id` comes from query. */
export class UpdateGradedCourseBodyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateIf((o: UpdateGradedCourseBodyDto) => !o.save_as_draft)
  @IsUUID()
  level_id?: string;

  @IsOptional()
  @IsBoolean()
  save_as_draft?: boolean;

  @IsNumber()
  @Min(0.01)
  total_marks: number;

  @IsIn(['sum', 'average'])
  aggregation_method: 'sum' | 'average';

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => CreateGradedSemesterBodyDto)
  semesters: CreateGradedSemesterBodyDto[];
}
