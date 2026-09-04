import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('direct_chat_threads')
export class DirectChatThread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_low_id', type: 'uuid' })
  user_low_id: string;

  @Column({ name: 'user_high_id', type: 'uuid' })
  user_high_id: string;

  @Column({ type: 'int', nullable: true })
  school_id: number | null;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  last_message_at: Date | null;

  @Column({ name: 'last_message_preview', type: 'varchar', length: 240, nullable: true })
  last_message_preview: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_low_id' })
  userLow: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_high_id' })
  userHigh: User;
}
