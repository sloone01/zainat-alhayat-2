import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class SaveCriterionMarkEntryDto {
  @IsUUID()
  student_id: string;

  @IsUUID()
  graded_criterion_id: string;

  /** null / omit clears the mark */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999)
  mark?: number | null;
}

export class SaveCriterionMarksGridDto {
  @IsUUID()
  group_id: string;

  @IsUUID()
  course_id: string;

  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => SaveCriterionMarkEntryDto)
  entries: SaveCriterionMarkEntryDto[];
}
