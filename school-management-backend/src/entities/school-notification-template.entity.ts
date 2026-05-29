import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { School } from './school.entity';

@Entity('school_notification_templates')
@Unique(['school_id', 'template_key'])
export class SchoolNotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'int' })
  school_id: number;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'template_key', type: 'varchar', length: 120 })
  template_key: string;

  /** When null, use system default subject. */
  @Column({ name: 'subject_override', type: 'text', nullable: true })
  subject_override: string | null;

  /** When null, use system default HTML. */
  @Column({ name: 'body_html_override', type: 'text', nullable: true })
  body_html_override: string | null;

  /** When null, use system default SMS body. */
  @Column({ name: 'body_sms_override', type: 'text', nullable: true })
  body_sms_override: string | null;

  @Column({ name: 'subject_override_ar', type: 'text', nullable: true })
  subject_override_ar: string | null;

  @Column({ name: 'body_html_override_ar', type: 'text', nullable: true })
  body_html_override_ar: string | null;

  @Column({ name: 'body_sms_override_ar', type: 'text', nullable: true })
  body_sms_override_ar: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
