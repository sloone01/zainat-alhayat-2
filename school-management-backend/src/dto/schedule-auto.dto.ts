import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const WEEK_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export class CreateScheduleLessonDemandDto {
  @IsUUID()
  group_id: string;

  @IsUUID()
  course_id: string;

  @IsUUID()
  teacher_id: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(40)
  periods_per_week: number;
}

export class UpdateScheduleLessonDemandDto {
  @IsOptional()
  @IsUUID()
  course_id?: string;

  @IsOptional()
  @IsUUID()
  teacher_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(40)
  periods_per_week?: number;
}

export class ReplaceScheduleLessonDemandItemDto {
  @IsUUID()
  course_id: string;

  @IsUUID()
  teacher_id: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(40)
  periods_per_week: number;
}

export class ReplaceScheduleLessonDemandsDto {
  @IsUUID()
  group_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReplaceScheduleLessonDemandItemDto)
  items: ReplaceScheduleLessonDemandItemDto[];
}

export class GenerateTimetableSlotDto {
  @IsString()
  start_time: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(240)
  duration_minutes: number;
}

export class GenerateTimetableDto {
  @IsUUID()
  group_id: string;

  @IsOptional()
  @IsBoolean()
  apply?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(WEEK_DAYS, { each: true })
  days?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenerateTimetableSlotDto)
  slots?: GenerateTimetableSlotDto[];
}
