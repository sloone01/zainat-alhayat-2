import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterPushTokenDto {
  @IsString()
  @MinLength(8)
  @MaxLength(4096)
  token: string;

  @IsIn(['ios', 'android', 'web'])
  platform: 'ios' | 'android' | 'web';

  @IsOptional()
  @IsString()
  @MaxLength(128)
  device_id?: string | null;
}

export class UnregisterPushTokenDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(4096)
  token?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  device_id?: string | null;
}
