import { IsIn } from 'class-validator';

export class DemoSessionDto {
  @IsIn(['staff', 'parents'])
  audience: 'staff' | 'parents';
}
