import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Course } from './course.entity';
import { GradedSemesterConfig } from './graded-semester-config.entity';

@Entity('graded_assessment_schemes')
export class GradedAssessmentScheme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'course_id' })
  course_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_marks: string;

  /** sum | average — how semester scores combine for the course total */
  @Column({ type: 'varchar', length: 20 })
  aggregation_method: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => GradedSemesterConfig, (s) => s.scheme, { cascade: true })
  semesters: GradedSemesterConfig[];
}
