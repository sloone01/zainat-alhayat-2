import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('notification_send_log')
@Unique('UQ_notification_send_log_key_entity_day', ['template_key', 'entity_id', 'sent_on'])
export class NotificationSendLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'template_key', type: 'varchar', length: 120 })
  template_key: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 160 })
  entity_id: string;

  @Column({ name: 'school_id', type: 'uuid', nullable: true })
  school_id: string | null;

  @Column({ name: 'sent_on', type: 'date' })
  sent_on: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}
