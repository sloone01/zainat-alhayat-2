import { IsUUID } from 'class-validator';

export class OpenDirectThreadDto {
  @IsUUID()
  target_user_id: string;
}

export class OpenDirectFromCourseDto {
  @IsUUID()
  student_id: string;

  @IsUUID()
  course_id: string;

  @IsUUID()
  group_id: string;
}
