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
import { Activity } from './activity.entity';

@Entity('school_message_letters')
export class SchoolMessageLetter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'int' })
  school_id: number;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  /** When set, audience is derived from the linked activity (group parents or all parents). */
  @Column({ name: 'activity_id', type: 'uuid', nullable: true })
  activity_id?: string | null;

  @ManyToOne(() => Activity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'activity_id' })
  activity?: Activity | null;

  /** Same shape as `MeetingRoomInviteDto` (all parents/teachers/students, groupIds, userIds). */
  @Column({ type: 'jsonb' })
  audience: Record<string, unknown>;

  @Column({ name: 'subject_en', type: 'text' })
  subject_en: string;

  @Column({ name: 'subject_ar', type: 'text' })
  subject_ar: string;

  @Column({ name: 'body_html_en', type: 'text' })
  body_html_en: string;

  @Column({ name: 'body_html_ar', type: 'text' })
  body_html_ar: string;

  @Column({ name: 'body_sms_en', type: 'text', nullable: true })
  body_sms_en: string | null;

  @Column({ name: 'body_sms_ar', type: 'text', nullable: true })
  body_sms_ar: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
