import { IsIn, IsString, MinLength } from 'class-validator';

export class PublicLetterApprovalDecisionDto {
  @IsString()
  @MinLength(16)
  token: string;

  @IsIn(['approve', 'reject'])
  decision: 'approve' | 'reject';
}
