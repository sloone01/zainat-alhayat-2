import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type NotificationTemplateChannel = 'email' | 'sms' | 'both';

export type NotificationTemplateAudience = 'school' | 'system';

@Entity('notification_template_definitions')
export class NotificationTemplateDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'template_key', type: 'varchar', length: 120, unique: true })
  template_key: string;

  @Column({ name: 'display_name', type: 'varchar', length: 200 })
  display_name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 20 })
  channel: NotificationTemplateChannel;

  @Column({ name: 'default_subject', type: 'text', nullable: true })
  default_subject: string | null;

  @Column({ name: 'default_body_html', type: 'text', nullable: true })
  default_body_html: string | null;

  @Column({ name: 'default_body_sms', type: 'text', nullable: true })
  default_body_sms: string | null;

  @Column({ name: 'default_subject_ar', type: 'text', nullable: true })
  default_subject_ar: string | null;

  @Column({ name: 'default_body_html_ar', type: 'text', nullable: true })
  default_body_html_ar: string | null;

  @Column({ name: 'default_body_sms_ar', type: 'text', nullable: true })
  default_body_sms_ar: string | null;

  /** JSON array: { "name": "schoolName", "description": "..." }[] */
  @Column({ name: 'variable_hints', type: 'jsonb', nullable: true })
  variable_hints: { name: string; description: string }[] | null;

  /** School admins edit copies of `school` templates. Platform edits `system` + shared defaults. */
  @Column({ name: 'audience', type: 'varchar', length: 20, default: 'school' })
  audience: NotificationTemplateAudience;

  @Column({ name: 'factory_subject', type: 'text', nullable: true })
  factory_subject: string | null;

  @Column({ name: 'factory_body_html', type: 'text', nullable: true })
  factory_body_html: string | null;

  @Column({ name: 'factory_body_sms', type: 'text', nullable: true })
  factory_body_sms: string | null;

  @Column({ name: 'factory_subject_ar', type: 'text', nullable: true })
  factory_subject_ar: string | null;

  @Column({ name: 'factory_body_html_ar', type: 'text', nullable: true })
  factory_body_html_ar: string | null;

  @Column({ name: 'factory_body_sms_ar', type: 'text', nullable: true })
  factory_body_sms_ar: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
