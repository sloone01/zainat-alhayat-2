import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';

export class CreateOnlineSessionDto {
  @IsUUID()
  schedule_id: string;

  @IsDateString()
  week_start_date: string;
}

export class OnlineSessionPresenceDto {
  @IsIn(['join', 'leave'])
  action: 'join' | 'leave';
}

export class ListSessionAttendanceRecordsQueryDto {
  /** School ids are UUIDs (same as `schools.id`); never coerce with Number(). */
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined ? undefined : String(value),
  )
  @IsUUID()
  school_id?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined ? undefined : String(value),
  )
  @IsUUID()
  group_id?: string;

  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;
}
