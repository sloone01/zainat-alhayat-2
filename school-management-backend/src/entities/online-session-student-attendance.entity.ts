import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OnlineVideoSession } from './online-video-session.entity';
import { Student } from './student.entity';

/**
 * One row per (online video session × student): attended / not_attended for that class only.
 * Linked to OnlineVideoSession; never merged into daily school attendances.
 */
@Entity('online_session_student_attendance')
export class OnlineSessionStudentAttendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'online_session_id' })
  online_session_id: string;

  @Column({ name: 'student_id' })
  student_id: string;

  /** attended | not_attended (legacy present/absent normalized by migration + API) */
  @Column({ length: 24 })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => OnlineVideoSession, (s) => s.studentAttendances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'online_session_id' })
  session: OnlineVideoSession;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
