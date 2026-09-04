import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { Course } from './course.entity';
import { School } from './school.entity';
import { StudentPayment } from './student-payment.entity';
import { User } from './user.entity';

export type StudentCourseEnrollmentStatus = 'active' | 'dropped';

@Entity('student_course_enrollments')
export class StudentCourseEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  student_id: string;

  @Column({ name: 'course_id', type: 'uuid' })
  course_id: string;

  @Column({ type: 'int' })
  school_id: number;

  @Column({ type: 'varchar', length: 24, default: 'active' })
  status: StudentCourseEnrollmentStatus;

  @Column({ name: 'student_payment_id', type: 'uuid', nullable: true })
  student_payment_id: string | null;

  @Column({ name: 'enrolled_by_user_id', type: 'uuid', nullable: true })
  enrolled_by_user_id: string | null;

  @Column({ name: 'enrolled_at', type: 'timestamptz' })
  enrolled_at: Date;

  @Column({ name: 'dropped_at', type: 'timestamptz', nullable: true })
  dropped_at: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => StudentPayment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'student_payment_id' })
  studentPayment: StudentPayment | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'enrolled_by_user_id' })
  enrolledByUser: User | null;
}
