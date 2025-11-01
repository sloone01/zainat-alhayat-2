import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { Course } from './course.entity';
import { Milestone } from './milestone.entity';
import { Staff } from './staff.entity';

@Entity('student_progress')
export class StudentProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, default: 'not_started' })
  status: string; // not_started, in_progress, completed, postponed, needs_review

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;

  @Column({ type: 'int', nullable: true })
  points_earned: number;

  @Column({ type: 'text', nullable: true })
  teacher_notes: string;

  @Column({ type: 'text', nullable: true })
  student_notes: string;

  @Column({ type: 'date', nullable: true })
  started_date: Date;

  @Column({ type: 'date', nullable: true })
  completed_date: Date;

  @Column({ type: 'date', nullable: true })
  due_date: Date;

  @Column({ type: 'boolean', default: false })
  is_late_submission: boolean;

  @Column({ type: 'int', nullable: true })
  attempts_count: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'json', nullable: true })
  attachments: any; // Store file paths or URLs

  @Column({ type: 'int' })
  student_id: number;

  @Column({ type: 'int' })
  course_id: number;

  @Column({ type: 'int' })
  milestone_id: number;

  @Column({ type: 'int', nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Student, student => student.progress)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Course, course => course.schedules)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Milestone, milestone => milestone.progress)
  @JoinColumn({ name: 'milestone_id' })
  milestone: Milestone;

  @ManyToOne(() => Staff, staff => staff.updated_progress)
  @JoinColumn({ name: 'updated_by' })
  updater: Staff;
}

