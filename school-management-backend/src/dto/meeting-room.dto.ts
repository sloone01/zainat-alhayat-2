import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
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
  @IsInt()
  @Min(1)
  school_id: number;

  @IsString()
  @MaxLength(255)
  title: string;

  /** ISO 8601 instant for when the meeting starts (browser typically sends UTC from `toISOString()`). */
  @IsDateString()
  scheduled_at: string;

  @IsObject()
  @ValidateNested()
  @Type(() => MeetingRoomInviteDto)
  invite: MeetingRoomInviteDto;
}
