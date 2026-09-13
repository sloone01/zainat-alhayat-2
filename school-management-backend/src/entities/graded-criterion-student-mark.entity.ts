import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { GradedCriterion } from './graded-criterion.entity';
import { Student } from './student.entity';
import { User } from './user.entity';

@Entity('graded_criterion_student_marks')
@Unique(['graded_criterion_id', 'student_id'])
@Index(['student_id'])
@Index(['graded_criterion_id'])
export class GradedCriterionStudentMark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'graded_criterion_id', type: 'uuid' })
  graded_criterion_id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  student_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mark: string | null;

  @Column({ name: 'updated_by_user_id', type: 'uuid', nullable: true })
  updated_by_user_id: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => GradedCriterion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'graded_criterion_id' })
  criterion: GradedCriterion;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'updated_by_user_id' })
  updatedBy: User;
}
