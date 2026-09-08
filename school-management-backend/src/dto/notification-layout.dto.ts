import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpsertNotificationLayoutDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  name_ar?: string | null;

  @IsString()
  @MinLength(1)
  html_en: string;

  @IsOptional()
  @IsString()
  html_ar?: string | null;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_default?: boolean;
}

export class PreviewNotificationLayoutDto {
  @IsOptional()
  @IsString()
  locale?: 'en' | 'ar';

  @IsString()
  @MinLength(1)
  html: string;

  /** Sample inner body for `{{content}}`. */
  @IsOptional()
  @IsString()
  sample_content?: string;

  @IsOptional()
  sample_variables?: Record<string, string>;

  @ValidateIf((_, v) => v != null)
  @Type(() => Number)
  @IsOptional()
  school_id?: number;
}
