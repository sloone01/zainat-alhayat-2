import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SchoolMessageLetter } from './school-message-letter.entity';

@Entity('school_message_letter_files')
export class SchoolMessageLetterFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'letter_id', type: 'uuid' })
  letter_id: string;

  @ManyToOne(() => SchoolMessageLetter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'letter_id' })
  letter: SchoolMessageLetter;

  @Column({ name: 'school_id', type: 'uuid' })
  school_id: string;

  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  original_name: string;

  @Column({ name: 'stored_path', type: 'varchar', length: 500 })
  stored_path: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 120 })
  mime_type: string;

  @Column({ name: 'size_bytes', type: 'int' })
  size_bytes: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}
