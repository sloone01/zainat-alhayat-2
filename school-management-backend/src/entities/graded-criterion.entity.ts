import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { GradedSemesterConfig } from './graded-semester-config.entity';
import { GradedCriterionTeacherTask } from './graded-criterion-teacher-task.entity';

@Entity('graded_criteria')
export class GradedCriterion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'semester_config_id' })
  semester_config_id: string;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  max_marks: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => GradedSemesterConfig, (s) => s.criteria, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'semester_config_id' })
  semester: GradedSemesterConfig;

  @OneToMany(() => GradedCriterionTeacherTask, (t) => t.gradedCriterion)
  teacher_tasks: GradedCriterionTeacherTask[];
}
