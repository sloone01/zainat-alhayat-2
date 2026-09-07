import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReportClientErrorDto {
  @IsString()
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  stack?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  component?: string;

  @IsOptional()
  @IsObject()
  extra?: Record<string, unknown>;
}
