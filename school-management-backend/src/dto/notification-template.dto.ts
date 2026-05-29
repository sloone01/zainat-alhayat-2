import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
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
  @IsInt()
  school_id?: number;
}
