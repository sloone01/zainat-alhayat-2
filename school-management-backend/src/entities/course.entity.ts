import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { School } from './school.entity';
import { Phase } from './phase.entity';
import { Schedule } from './schedule.entity';
import { AcademicYear } from './academic-year.entity';
import { SchoolPaymentLevel } from './school-payment-level.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: true })
  name: string;

  // Frontend compatibility fields
  @Column({ length: 255, nullable: true })
  title: string; // Alias for name

  @Column({ length: 100, nullable: true })
  category: string; // Course category

  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'published', 'inactive', 'archived'],
    default: 'draft'
  })
  /** Lifecycle: `draft` until submit, then `active` / `published` / `archived`. Not the Active/Not active toggle. */
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  age_group_min: number;

  @Column({ type: 'int', nullable: true })
  age_group_max: number;

  /** Active / Not active toggle. Independent of `status`. */
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ length: 50, nullable: true })
  color_code: string;

  @Column({ length: 100, nullable: true })
  icon: string;

  @Column({ type: 'boolean', default: true })
  send_notifications: boolean;

  @Column({ type: 'int', nullable: true })
  estimated_duration_weeks: number;

  @Column({ type: 'text', nullable: true })
  learning_objectives: string;

  @Column({ type: 'text', nullable: true })
  prerequisites: string;

  @Column({ type: 'text', nullable: true })
  materials_needed: string;

  @Column({ type: 'uuid' })
  school_id: string;

  /** milestone | graded | standalone — materials work for all kinds */
  @Column({ type: 'varchar', length: 32, default: 'milestone' })
  course_kind: string;

  @Column({ name: 'academic_year_id', nullable: true })
  academic_year_id: string;

  /** School grade / payment level — used to filter courses on the timetable. */
  @Column({ name: 'level_id', type: 'uuid', nullable: true })
  level_id: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Computed fields for frontend compatibility
  @Column({ type: 'int', nullable: true })
  totalDuration: number; // Total duration in weeks

  @Column({ type: 'date', nullable: true })
  createdDate: Date; // Alias for created_at

  @Column({ type: 'date', nullable: true })
  lastModified: Date; // Alias for updated_at

  @Column({ length: 50, nullable: true })
  targetAgeGroup: string; // Age group description

  @Column({ length: 50, nullable: true })
  difficultyLevel: string; // Difficulty level

  @Column({ type: 'int', nullable: true })
  maxStudents: number; // Maximum students

  // Relations
  @ManyToOne(() => School, school => school.courses)
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => AcademicYear, academicYear => academicYear.courses)
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @ManyToOne(() => SchoolPaymentLevel, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'level_id' })
  level: SchoolPaymentLevel | null;

  @OneToMany(() => Phase, phase => phase.course)
  phases: Phase[];

  @OneToMany(() => Schedule, schedule => schedule.course)
  schedules: Schedule[];
}

