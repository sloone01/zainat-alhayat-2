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
import { Schedule } from './schedule.entity';
import { User } from './user.entity';
import { OnlineSessionPresence } from './online-session-presence.entity';
import { OnlineSessionStudentAttendance } from './online-session-student-attendance.entity';

@Entity('online_video_sessions')
export class OnlineVideoSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'schedule_id' })
  schedule_id: string;

  @Column({ type: 'date', name: 'week_start_date' })
  week_start_date: string;

  @Column({ type: 'date', name: 'session_date' })
  session_date: string;

  @Column({ length: 32, default: 'daily' })
  provider: string;

  @Column({ length: 128 })
  room_name: string;

  @Column({ type: 'text' })
  room_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recording_id: string | null;

  @Column({ type: 'text', nullable: true })
  recording_url: string | null;

  @Column({ name: 'created_by' })
  created_by: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  /** When auto-absent pass ran after schedule end (+ grace) */
  @Column({ name: 'attendance_finalized_at', type: 'timestamptz', nullable: true })
  attendance_finalized_at: Date | null;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => OnlineSessionPresence, (p) => p.session)
  presences: OnlineSessionPresence[];

  @OneToMany(() => OnlineSessionStudentAttendance, (a) => a.session)
  studentAttendances: OnlineSessionStudentAttendance[];
}
