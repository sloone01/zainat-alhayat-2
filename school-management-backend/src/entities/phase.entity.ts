import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from './course.entity';
import { Milestone } from './milestone.entity';

@Entity('phases')
export class Phase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'order_index', type: 'int' })
  order: number;

  @Column({ name: 'estimated_duration_days', type: 'int', nullable: true })
  duration_weeks: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @Column({ name: 'course_id', nullable: true })
  course_id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;


  // Relations
  @ManyToOne(() => Course, course => course.phases)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => Milestone, milestone => milestone.phase)
  milestones: Milestone[];
}

