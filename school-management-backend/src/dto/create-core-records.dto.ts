import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * These bodies used to be typed with plain interfaces, which TypeScript erases — the
 * global ValidationPipe had no metatype to check, so a missing required field reached
 * Postgres and surfaced as a 500 ("null value in column ... violates not-null").
 * As classes they are validated, and a bad request is a 400 that names the field.
 */

export class CreateAcademicYearDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  year: string;

  @Type(() => Date)
  @IsDate()
  start_date: Date;

  @Type(() => Date)
  @IsDate()
  end_date: Date;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  school_id: number;
}

export class CreateSemesterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title: string;

  @Type(() => Date)
  @IsDate()
  start_date: Date;

  @Type(() => Date)
  @IsDate()
  end_date: Date;

  @IsUUID()
  academic_year_id: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export class CreateScheduleDto {
  @IsIn(DAYS)
  day_of_week: string;

  @IsString()
  @MaxLength(8)
  start_time: string;

  @IsString()
  @MaxLength(8)
  end_time: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration_minutes: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  specific_date?: Date;

  @IsUUID()
  group_id: string;

  @IsOptional()
  @IsUUID()
  course_id?: string;

  @IsOptional()
  @IsUUID()
  teacher_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  room_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;
}

export class CreateBusDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  driverName: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  driverContacts?: string;

  @Type(() => Number)
  @IsInt()
  school_id: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class CreateProgressDto {
  @IsString()
  @MaxLength(40)
  status: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  score?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  points_earned?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  teacher_notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  student_notes?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  started_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completed_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  due_date?: Date;

  @IsOptional()
  @IsBoolean()
  is_late_submission?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  feedback?: string;

  @IsOptional()
  attachments?: unknown;

  @IsUUID()
  student_id: string;

  @IsUUID()
  course_id: string;

  @IsUUID()
  milestone_id: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  updated_by?: number;
}
