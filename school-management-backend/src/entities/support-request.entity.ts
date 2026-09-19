import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export const SUPPORT_REQUEST_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;
export type SupportRequestStatus = (typeof SUPPORT_REQUEST_STATUSES)[number];

/** A support request (title + sanitized rich-text description) submitted by any user. */
@Entity('support_requests')
export class SupportRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  school_id?: string | null;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ length: 200 })
  title: string;

  /** Sanitized HTML from the rich-text editor; images reference /api/files/support/... */
  @Column({ name: 'description_html', type: 'text' })
  description_html: string;

  @Column({ type: 'varchar', length: 20, default: 'open' })
  status: SupportRequestStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
