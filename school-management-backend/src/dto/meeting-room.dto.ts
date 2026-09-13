import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class MeetingRoomInviteDto {
  @IsOptional()
  @IsBoolean()
  allParents?: boolean;

  @IsOptional()
  @IsBoolean()
  allTeachers?: boolean;

  @IsOptional()
  @IsBoolean()
  allStudents?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  groupIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  userIds?: string[];
}

export class CreateMeetingRoomDto {
  @IsOptional()
  @IsUUID()
  school_id: string;

  @IsString()
  @MaxLength(255)
  title: string;

  /** ISO 8601 instant for when the meeting starts (browser typically sends UTC from `toISOString()`). */
  @IsOptional()
  @IsDateString()
  scheduled_at?: string;

  @IsOptional()
  @IsBoolean()
  save_as_draft?: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => MeetingRoomInviteDto)
  invite: MeetingRoomInviteDto;
}
