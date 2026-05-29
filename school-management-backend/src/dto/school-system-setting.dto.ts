import { Allow, IsArray, IsBoolean, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SchoolSettingBulkItemDto {
  @IsString()
  key: string;

  @Allow()
  value: unknown;
}

export class SchoolSettingBulkDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SchoolSettingBulkItemDto)
  settings: SchoolSettingBulkItemDto[];
}

export class CreateSchoolSettingDto {
  @IsString()
  key: string;

  @Allow()
  value: unknown;

  @IsIn(['string', 'boolean', 'number', 'json'])
  type: 'string' | 'boolean' | 'number' | 'json';

  @IsString()
  category: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}

export class PatchSchoolSettingDto {
  @Allow()
  value: unknown;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}
