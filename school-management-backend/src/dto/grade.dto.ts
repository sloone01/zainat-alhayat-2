import { IsString, IsNumber, IsBoolean, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateGradeDto {
  @IsString()
  @MaxLength(100)
  nameEn: string;

  @IsString()
  @MaxLength(100)
  nameAr: string;

  @IsString()
  @MaxLength(50)
  code: string;

  @IsNumber()
  @Min(0)
  displayOrder: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateGradeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}