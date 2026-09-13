import { Type } from 'class-transformer';
import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class NotificationTemplateLocaleBodyDto {
  @IsString()
  @MinLength(1)
  subject: string;

  @IsString()
  @MinLength(1)
  body_html: string;

  @IsOptional()
  @IsString()
  body_sms?: string;
}

export class UpdateSchoolNotificationTemplateDto {
  @ValidateNested()
  @Type(() => NotificationTemplateLocaleBodyDto)
  en: NotificationTemplateLocaleBodyDto;

  @ValidateNested()
  @Type(() => NotificationTemplateLocaleBodyDto)
  ar: NotificationTemplateLocaleBodyDto;

  /** Selected email layout id; null clears to school default / built-in chrome. */
  @IsOptional()
  @IsString()
  layout_id?: string | null;
}

export class PreviewNotificationTemplateDto {
  @IsOptional()
  @IsIn(['en', 'ar'])
  locale?: 'en' | 'ar';

  @IsString()
  @MinLength(1)
  subject: string;

  @IsString()
  @MinLength(1)
  body_html: string;

  @IsOptional()
  @IsString()
  body_sms?: string;

  @IsObject()
  sample_variables: Record<string, string>;

  /** When set, `schoolName` in sample_variables is always taken from this school (not client-edited). */
  @IsOptional()
  @IsUUID()
  school_id?: string;

  @IsOptional()
  @IsString()
  layout_id?: string | null;
}
