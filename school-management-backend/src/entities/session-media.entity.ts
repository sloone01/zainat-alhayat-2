import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WeeklySessionPlan } from './weekly-session-plan.entity';
import { User } from './user.entity';

@Entity('session_media')
export class SessionMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_plan_id' })
  session_plan_id: string;

  @Column({ length: 255 })
  file_name: string;

  @Column({ length: 500 })
  file_path: string;

  @Column({ length: 10 })
  file_type: string; // 'photo' or 'video'

  @Column({ type: 'int' })
  file_size: number;

  @Column({ length: 100 })
  mime_type: string;

  @Column({ name: 'uploaded_by' })
  uploaded_by: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploaded_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => WeeklySessionPlan, plan => plan.media)
  @JoinColumn({ name: 'session_plan_id' })
  sessionPlan: WeeklySessionPlan;

  @ManyToOne(() => User, user => user.uploadedMedia)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedByUser: User;
}
