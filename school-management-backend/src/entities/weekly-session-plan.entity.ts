import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Schedule } from './schedule.entity';
import { User } from './user.entity';
import { SessionMedia } from './session-media.entity';

@Entity('weekly_session_plans')
export class WeeklySessionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'schedule_id' })
  schedule_id: string;

  @Column({ type: 'date' })
  week_start_date: Date;

  @Column({ type: 'date' })
  week_end_date: Date;

  @Column({ length: 255 })
  task_title: string;

  @Column({ type: 'text', nullable: true })
  task_description: string;

  @Column({ type: 'boolean', default: false })
  is_completed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completion_date: Date;

  @Column({ type: 'text', nullable: true })
  completion_notes: string;

  @Column({ name: 'created_by' })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Schedule, schedule => schedule.weeklySessionPlans)
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  @ManyToOne(() => User, user => user.weeklySessionPlans)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => SessionMedia, media => media.sessionPlan)
  media: SessionMedia[];
}
