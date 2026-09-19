import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { School } from './school.entity';
import { Student } from './student.entity';
import { User } from './user.entity';

export type AbsenceExcuseStatus = 'pending' | 'approved' | 'rejected';

@Entity('absence_excuses')
export class AbsenceExcuse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  school_id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'uuid' })
  submitted_by_user_id: string;

  @Column({ type: 'date' })
  absence_date: string;

  @Column({ type: 'text' })
  explanation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  original_filename: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stored_filename: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  mime_type: string | null;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status: AbsenceExcuseStatus;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by_user_id: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewed_at: Date | null;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submitted_by_user_id' })
  submitted_by: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by_user_id' })
  reviewed_by: User | null;
}
