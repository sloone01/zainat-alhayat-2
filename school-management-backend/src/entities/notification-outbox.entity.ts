import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import type { NotificationChannel, NotifyRecipient } from '../notifications/notification.types';

export type NotificationOutboxStatus = 'pending' | 'sending' | 'sent' | 'failed';

/** Durable email/push jobs. The API process drains this table locally and on the server. */
@Entity('notification_outbox')
@Index('IDX_notification_outbox_pending', ['status', 'available_at'])
export class NotificationOutboxJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid', nullable: true })
  school_id: string | null;

  @Column({ name: 'template_key', type: 'varchar', length: 120 })
  template_key: string;

  @Column({ type: 'varchar', length: 8, default: 'ar' })
  locale: string;

  @Column({ type: 'jsonb', default: {} })
  variables: Record<string, string>;

  @Column({ type: 'jsonb', default: [] })
  recipients: NotifyRecipient[];

  @Column({ type: 'jsonb', nullable: true })
  channels: NotificationChannel[] | null;

  @Column({ name: 'push_data', type: 'jsonb', nullable: true })
  push_data: Record<string, string> | null;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status: NotificationOutboxStatus;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  last_error: string | null;

  @Column({ name: 'available_at', type: 'timestamptz' })
  available_at: Date;

  @Column({ name: 'claimed_at', type: 'timestamptz', nullable: true })
  claimed_at: Date | null;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sent_at: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}
