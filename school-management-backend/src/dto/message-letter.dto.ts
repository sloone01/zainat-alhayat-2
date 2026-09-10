import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { MeetingRoomInviteDto } from './meeting-room.dto';
import { NotificationTemplateLocaleBodyDto } from './notification-template.dto';

export class CreateSchoolMessageLetterDto {
  @IsOptional()
  @IsUUID()
  school_id: string;

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
  @IsOptional()
  @IsUUID()
  school_id: string;

  @ValidateNested()
  @Type(() => MeetingRoomInviteDto)
  audience: MeetingRoomInviteDto;
}

export class DispatchSchoolMessageLetterDto {
  @IsOptional()
  @IsUUID()
  school_id: string;

  @IsIn(['email', 'sms', 'chat', 'chat_approval'])
  channel: 'email' | 'sms' | 'chat' | 'chat_approval';
}

export class RemindSchoolMessageLetterDto {
  @IsOptional()
  @IsUUID()
  school_id: string;

  @IsString()
  recipient_user_id: string;
}
