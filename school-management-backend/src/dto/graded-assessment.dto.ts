import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateGradedCriterionBodyDto {
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
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateGradedCriterionBodyDto)
  criteria: CreateGradedCriterionBodyDto[];
}

export class CreateGradedCourseBodyDto {
  @IsNumber()
  school_id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  academic_year_id?: string;

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
