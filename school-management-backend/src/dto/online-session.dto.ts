import { IsDateString, IsIn, IsUUID } from 'class-validator';

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
