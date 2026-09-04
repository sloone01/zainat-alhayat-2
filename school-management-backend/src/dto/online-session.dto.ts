import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsUUID } from 'class-validator';

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
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  school_id?: number;

  @IsOptional()
  @IsUUID()
  group_id?: string;

  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;
}
