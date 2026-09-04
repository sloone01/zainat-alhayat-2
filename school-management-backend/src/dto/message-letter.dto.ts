import { Type } from 'class-transformer';
import { IsIn, IsInt, IsString, MaxLength, Min, ValidateNested } from 'class-validator';
import { MeetingRoomInviteDto } from './meeting-room.dto';
import { NotificationTemplateLocaleBodyDto } from './notification-template.dto';

export class CreateSchoolMessageLetterDto {
  @IsInt()
  @Min(1)
  school_id: number;

  @IsString()
  @MaxLength(200)
  title: string;

  @ValidateNested()
  @Type(() => MeetingRoomInviteDto)
  audience: MeetingRoomInviteDto;

  @ValidateNested()
  @Type(() => NotificationTemplateLocaleBodyDto)
  en: NotificationTemplateLocaleBodyDto;

  @ValidateNested()
  @Type(() => NotificationTemplateLocaleBodyDto)
  ar: NotificationTemplateLocaleBodyDto;
}

export class UpdateSchoolMessageLetterDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @ValidateNested()
  @Type(() => MeetingRoomInviteDto)
  audience: MeetingRoomInviteDto;

  @ValidateNested()
  @Type(() => NotificationTemplateLocaleBodyDto)
  en: NotificationTemplateLocaleBodyDto;

  @ValidateNested()
  @Type(() => NotificationTemplateLocaleBodyDto)
  ar: NotificationTemplateLocaleBodyDto;
}

export class MessageLetterAudiencePreviewDto {
  @IsInt()
  @Min(1)
  school_id: number;

  @ValidateNested()
  @Type(() => MeetingRoomInviteDto)
  audience: MeetingRoomInviteDto;
}

export class DispatchSchoolMessageLetterDto {
  @IsInt()
  @Min(1)
  school_id: number;

  @IsIn(['email', 'chat', 'chat_approval'])
  channel: 'email' | 'chat' | 'chat_approval';
}
