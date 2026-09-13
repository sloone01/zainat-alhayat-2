import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { School } from './school.entity';
import { User } from './user.entity';

export type OutboundMessageChannel = 'email' | 'sms';
export type OutboundMessageStatus = 'sent' | 'failed' | 'skipped';

@Entity('outbound_message_transactions')
@Index('IDX_outbound_msg_tx_school_created', ['school_id', 'created_at'])
@Index('IDX_outbound_msg_tx_channel_status', ['channel', 'status'])
export class OutboundMessageTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid', nullable: true })
  school_id: string | null;

  @ManyToOne(() => School, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'school_id' })
  school?: School | null;

  @Column({ type: 'varchar', length: 16 })
  channel: OutboundMessageChannel;

  @Column({ type: 'varchar', length: 16 })
  status: OutboundMessageStatus;

  /** Email address or phone number. */
  @Column({ name: 'to_address', type: 'varchar', length: 320 })
  to_address: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  subject: string | null;

  @Column({ name: 'body_html', type: 'text', nullable: true })
  body_html: string | null;

  /** Plain text / SMS body. */
  @Column({ name: 'body_text', type: 'text', nullable: true })
  body_text: string | null;

  @Column({ name: 'template_key', type: 'varchar', length: 120, nullable: true })
  template_key: string | null;

  @Column({ name: 'recipient_user_id', type: 'uuid', nullable: true })
  recipient_user_id: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'recipient_user_id' })
  recipient_user?: User | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  error_message: string | null;

  @Column({ name: 'provider_message_id', type: 'varchar', length: 255, nullable: true })
  provider_message_id: string | null;

  /** e.g. dispatcher, message_letter, error_alert, smtp_test, resend */
  @Column({ type: 'varchar', length: 64, nullable: true })
  source: string | null;

  @Column({ name: 'resent_from_id', type: 'uuid', nullable: true })
  resent_from_id: string | null;

  @ManyToOne(() => OutboundMessageTransaction, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'resent_from_id' })
  resent_from?: OutboundMessageTransaction | null;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sent_at: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
