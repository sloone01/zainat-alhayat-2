import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { SUPPORT_REQUEST_STATUSES, type SupportRequestStatus } from '../entities/support-request.entity';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

/** Diagnostic context captured by the "Report issue" button. Every field is optional. */
export class SupportRequestContextDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  page_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  user_agent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  viewport?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  language?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  captured_at?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(2000, { each: true })
  console_errors?: string[];

  /** Must be an image uploaded through POST /support-requests/images. */
  @IsOptional()
  @IsString()
  @Matches(/^\/api\/files\/support\/[A-Za-z0-9_.-]+$/)
  screenshot_url?: string;
}

export class CreateSupportRequestDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  /** Rich-text HTML from the editor (sanitized server-side). */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100_000)
  description_html: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SupportRequestContextDto)
  context?: SupportRequestContextDto;
}

export class UpdateSupportRequestStatusDto {
  @IsIn([...SUPPORT_REQUEST_STATUSES])
  status: SupportRequestStatus;
}

export class UpdateSupportRequestFixedDto {
  @IsBoolean()
  fixed: boolean;
}

export class SupportRequestQueryDto {
  @IsOptional()
  @IsIn([...SUPPORT_REQUEST_STATUSES])
  status?: SupportRequestStatus;
}
