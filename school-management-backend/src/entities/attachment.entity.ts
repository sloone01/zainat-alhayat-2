import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Every table an attachment can belong to. Add a value here (and nothing else)
 * to make a new part of the system attachable.
 */
export const ATTACHMENT_ENTITY_TYPES = [
  'student',
  'staff',
  'parent',
  'user',
  'course',
  'activity',
  'school',
  'enrollment',
  'support_request',
  'payment',
  'bus',
  'weekly_session_plan',
] as const;
export type AttachmentEntityType = (typeof ATTACHMENT_ENTITY_TYPES)[number];

/** Metadata of one stored file. The binary lives on disk under uploads/attachments/. */
@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Original file name as uploaded (shown to users, used in Content-Disposition). */
  @Column({ length: 255 })
  file_name: string;

  /** Server-generated unique name on disk; never derived from user input. */
  @Column({ length: 255, unique: true })
  stored_name: string;

  @Column({ length: 100 })
  mime_type: string;

  @Column({ type: 'bigint' })
  size_bytes: number;

  /** Canonical download URL (served by the attachment controller, auth required). */
  @Column({ length: 500 })
  url: string;

  /** SHA-256 of the content — spot duplicates and verify integrity. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  checksum?: string | null;

  @Column({ type: 'uuid', nullable: true })
  uploaded_by?: string | null;

  /** School scope for multi-tenant filtering; null = platform-level file. */
  @Column({ type: 'uuid', nullable: true })
  school_id?: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * Generic link: attaches an Attachment to any row of any table (entity_type +
 * entity_id), giving every entity a 1-to-many attachment list without new columns.
 */
@Entity('attachment_links')
@Unique(['attachment_id', 'entity_type', 'entity_id'])
@Index(['entity_type', 'entity_id'])
export class AttachmentLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  attachment_id: string;

  @ManyToOne(() => Attachment, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attachment_id' })
  attachment?: Attachment;

  @Column({ type: 'varchar', length: 40 })
  entity_type: AttachmentEntityType;

  @Column({ type: 'uuid' })
  entity_id: string;

  /** Optional role of the file for this entity, e.g. "medical_report", "photo" — lets one entity carry several kinds of attachments. */
  @Column({ type: 'varchar', length: 40, nullable: true })
  purpose?: string | null;

  @CreateDateColumn()
  created_at: Date;
}
