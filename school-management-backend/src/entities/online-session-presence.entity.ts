import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OnlineVideoSession } from './online-video-session.entity';
import { User } from './user.entity';

@Entity('online_session_presence')
export class OnlineSessionPresence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'online_session_id' })
  online_session_id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  display_name: string | null;

  @Column({ type: 'timestamptz', name: 'joined_at' })
  joined_at: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'left_at' })
  left_at: Date | null;

  @ManyToOne(() => OnlineVideoSession, (s) => s.presences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'online_session_id' })
  session: OnlineVideoSession;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
