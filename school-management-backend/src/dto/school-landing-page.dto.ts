import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const emptyToNull = ({ value }: { value: unknown }) =>
  value === '' || value === undefined ? null : value;

export class LandingFeatureDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title_en?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  body_en?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  body_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  icon?: string;
}

export class LandingTestimonialDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  quote_en?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  quote_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  author_en?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  author_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  role_en?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  role_ar?: string;
}

export class UpsertSchoolLandingPageDto {
  @IsOptional()
  @IsString()
  logo_url?: string | null;

  @IsOptional()
  @IsString()
  hero_image_url?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  brand_name_en?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  brand_name_ar?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  badge_en?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  badge_ar?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  hero_title_en?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  hero_title_ar?: string | null;

  @IsOptional()
  @IsString()
  hero_subtitle_en?: string | null;

  @IsOptional()
  @IsString()
  hero_subtitle_ar?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  cta_primary_en?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  cta_primary_ar?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  cta_secondary_en?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  cta_secondary_ar?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LandingFeatureDto)
  features?: LandingFeatureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LandingTestimonialDto)
  testimonials?: LandingTestimonialDto[];

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsEmail()
  @MaxLength(120)
  email?: string | null;

  @IsOptional()
  @IsString()
  address_en?: string | null;

  @IsOptional()
  @IsString()
  address_ar?: string | null;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  landing_slug?: string | null;
}
