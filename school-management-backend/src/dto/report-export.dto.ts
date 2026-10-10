import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';

export class UpdateReportExportConfigDto {
  @IsArray()
  @IsString({ each: true })
  columns!: string[];

  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsUUID()
  template_id?: string | null;
}

export class UpsertReportExportTemplateDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  name_ar?: string | null;

  @IsString()
  html_en!: string;

  @IsOptional()
  @IsString()
  html_ar?: string | null;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class PreviewReportExportTemplateDto {
  @IsOptional()
  @IsString()
  locale?: 'en' | 'ar';

  @IsString()
  html!: string;

  @IsOptional()
  @IsString()
  sample_content?: string;

  @IsOptional()
  @IsUUID()
  school_id?: string;
}
