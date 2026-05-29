import { IsArray, IsOptional, IsString, IsUUID, ArrayMinSize } from 'class-validator';

export class EnrollStudentsToCourseDto {
  @IsUUID()
  course_id: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  student_ids: string[];
}

export class EnrollStudentInCoursesDto {
  @IsUUID()
  student_id: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  course_ids: string[];
}

export class ListCourseEnrollmentsQueryDto {
  @IsOptional()
  school_id?: string;

  @IsOptional()
  @IsUUID()
  course_id?: string;

  @IsOptional()
  @IsUUID()
  student_id?: string;

  @IsOptional()
  @IsString()
  status?: 'active' | 'dropped';
}
