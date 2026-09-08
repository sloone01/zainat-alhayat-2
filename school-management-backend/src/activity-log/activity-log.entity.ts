import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * One row per mutating API request. Actor details are denormalised so the trail
 * survives the user being renamed or deleted. Request bodies are deliberately NOT
 * stored — they carry passwords and student PII.
 */
@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  username: string | null;

  @Column({ name: 'user_role', type: 'varchar', length: 50, nullable: true })
  user_role: string | null;

  @Column({ name: 'school_id', type: 'int', nullable: true })
  school_id: number | null;

  @Column({ type: 'varchar', length: 10 })
  method: string;

  @Column({ type: 'varchar', length: 500 })
  path: string;

  @Column({ name: 'status_code', type: 'int' })
  status_code: number;

  @Column({ name: 'duration_ms', type: 'int', default: 0 })
  duration_ms: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  user_agent: string | null;

  /** Exception name (e.g. QueryFailedError, BadRequestException) for failed requests. */
  @Column({ name: 'error_code', type: 'varchar', length: 100, nullable: true })
  error_code: string | null;

  @Column({ name: 'error_message', type: 'varchar', length: 1000, nullable: true })
  error_message: string | null;

  @Index()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
