import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsUUID,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class SaveCriterionMarkEntryDto {
  @IsUUID()
  student_id: string;

  @IsUUID()
  graded_criterion_id: string;

  /** null clears the mark. Skip number checks so an empty cell is not a 400. */
  @Transform(({ value }) => (value === '' || value === undefined ? null : value))
  @ValidateIf((_, value) => value !== null && value !== undefined)
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
