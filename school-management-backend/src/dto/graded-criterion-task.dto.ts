import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class TaskLineDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  due_date?: string | null;
}

export class AppendGradedCriterionTaskDto {
  @IsUUID()
  graded_criterion_id: string;

  @IsUUID()
  group_id: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  due_date?: string | null;
}

export class SyncGradedCriterionTasksDto {
  @IsUUID()
  graded_criterion_id: string;

  @IsBoolean()
  apply_to_all_classes: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  group_ids?: string[];

  /** Empty = one system-default task per target group. Non-empty = replace all tasks per group with these rows. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskLineDto)
  tasks: TaskLineDto[];
}

export class PatchGradedCriterionTaskDto {
  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsDateString()
  due_date?: string | null;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}

export class MarksGridEntryDto {
  @IsUUID()
  student_id: string;

  @IsUUID()
  graded_criterion_teacher_task_id: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  mark?: number | null;
}

export class SaveMarksGridDto {
  @IsUUID()
  group_id: string;

  @IsUUID()
  course_id: string;

  @IsUUID()
  graded_criterion_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarksGridEntryDto)
  entries: MarksGridEntryDto[];
}
