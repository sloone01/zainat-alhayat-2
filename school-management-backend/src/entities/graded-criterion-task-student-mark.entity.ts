import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GradedCriterionTeacherTask } from './graded-criterion-teacher-task.entity';
import { Student } from './student.entity';
import { User } from './user.entity';

@Entity('graded_criterion_task_student_marks')
export class GradedCriterionTaskStudentMark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'graded_criterion_teacher_task_id' })
  graded_criterion_teacher_task_id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  student_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mark: string | null;

  @Column({ name: 'updated_by_teacher_id', type: 'uuid', nullable: true })
  updated_by_teacher_id: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => GradedCriterionTeacherTask, (t) => t.student_marks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'graded_criterion_teacher_task_id' })
  task: GradedCriterionTeacherTask;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'updated_by_teacher_id' })
  updatedByTeacher: User;
}
