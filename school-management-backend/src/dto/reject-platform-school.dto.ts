import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectPlatformSchoolDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
