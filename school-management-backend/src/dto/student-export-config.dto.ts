import { IsArray, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';

export class UpdateStudentExportConfigDto {
  @IsArray()
  @IsString({ each: true })
  columns!: string[];

  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsUUID()
  layout_id?: string | null;
}
