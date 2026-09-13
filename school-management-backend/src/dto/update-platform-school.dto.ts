import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

/** Editable registration details submitted by a school. Status is managed from the billing drawer. */
export class UpdatePlatformSchoolDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name_ar?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name_en?: string | null;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  address?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  owner_legal_name?: string | null;
}
