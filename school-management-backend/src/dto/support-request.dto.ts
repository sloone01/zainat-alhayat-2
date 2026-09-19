import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { SUPPORT_REQUEST_STATUSES, type SupportRequestStatus } from '../entities/support-request.entity';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

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
}

export class UpdateSupportRequestStatusDto {
  @IsIn([...SUPPORT_REQUEST_STATUSES])
  status: SupportRequestStatus;
}

export class SupportRequestQueryDto {
  @IsOptional()
  @IsIn([...SUPPORT_REQUEST_STATUSES])
  status?: SupportRequestStatus;
}
