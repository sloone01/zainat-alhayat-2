import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('error_tickets')
export class ErrorTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  ticket: string;

  @Column({ type: 'varchar', length: 20 })
  source: 'api' | 'client';

  @Column({ name: 'status_code', type: 'int', nullable: true })
  status_code: number | null;

  @Column({ type: 'varchar', length: 2000 })
  message: string;

  @Column({ type: 'text', nullable: true })
  stack: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  method: string | null;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  path: string | null;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  url: string | null;

  @Column({ name: 'user_id', type: 'varchar', length: 64, nullable: true })
  user_id: string | null;

  @Column({ name: 'school_id', type: 'uuid', nullable: true })
  school_id: string | null;

  @Column({ name: 'request_id', type: 'varchar', length: 64, nullable: true })
  request_id: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  user_agent: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  component: string | null;

  @Column({ type: 'jsonb', nullable: true })
  extra: Record<string, unknown> | null;

  @Index()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
