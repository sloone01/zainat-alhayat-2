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
import { GradedAssessmentScheme } from './graded-assessment-scheme.entity';
import { GradedCriterion } from './graded-criterion.entity';

@Entity('graded_semester_configs')
export class GradedSemesterConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'scheme_id' })
  scheme_id: string;

  @Column({ type: 'int' })
  semester_index: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => GradedAssessmentScheme, (sch) => sch.semesters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scheme_id' })
  scheme: GradedAssessmentScheme;

  @OneToMany(() => GradedCriterion, (c) => c.semester, { cascade: true })
  criteria: GradedCriterion[];
}
