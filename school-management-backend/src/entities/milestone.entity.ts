import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Phase } from './phase.entity';
import { StudentProgress } from './student-progress.entity';

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'order_index', type: 'int' })
  order: number;

  @Column({ name: 'is_required', type: 'boolean', default: true })
  isRequired: boolean;

  @Column({ type: 'int', nullable: true, select: false })
  points: number;

  @Column({ name: 'phase_id', nullable: true })
  phase_id: string;

  // Legacy fields for backward compatibility
  @Column({ length: 255, nullable: true, select: false })
  title: string;

  @Column({ length: 50, nullable: true, select: false })
  type: string; // assessment, project, activity, presentation, exam, assignment

  @Column({ type: 'int', nullable: true, select: false })
  target_week: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, select: false })
  weight: number;

  @Column({ length: 50, nullable: true, select: false })
  difficulty_level: string;

  @Column({ type: 'int', nullable: true, select: false })
  estimated_duration_minutes: number;

  @Column({ type: 'text', nullable: true, select: false })
  required_resources: string;

  @Column({ name: 'allow_late_submission', type: 'boolean', default: false, select: false })
  allow_late_submission: boolean;

  @Column({ name: 'enable_peer_review', type: 'boolean', default: false, select: false })
  enable_peer_review: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Phase, phase => phase.milestones)
  @JoinColumn({ name: 'phase_id' })
  phase: Phase;

  @OneToMany(() => StudentProgress, progress => progress.milestone)
  progress: StudentProgress[];
}

