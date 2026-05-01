import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  activity_date: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  start_time?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  end_time?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsString()
  @MaxLength(100)
  activity_type: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @Type(() => Number)
  @IsInt()
  school_id: number;

  @IsOptional()
  @IsUUID()
  group_id?: string;

  @IsOptional()
  @IsUUID()
  created_by?: string;
}

export class UpdateActivityDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  activity_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  start_time?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  end_time?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  activity_type?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsUUID()
  group_id?: string | null;
}

export class ActivityQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  school_id?: number;

  @IsOptional()
  @IsUUID()
  group_id?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  activity_type?: string;

  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;
}
