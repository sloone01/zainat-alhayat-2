import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

/** One last-read cursor per user per chat room (class / adhoc / bus share room_id space). */
@Entity('chat_room_read_states')
export class ChatRoomReadState {
  @PrimaryColumn({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @PrimaryColumn({ type: 'uuid' })
  @Index()
  room_id: string;

  @Column({ type: 'timestamptz' })
  last_read_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
