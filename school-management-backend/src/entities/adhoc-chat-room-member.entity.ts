import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { AdhocChatRoom } from './adhoc-chat-room.entity';

@Entity('adhoc_chat_room_members')
@Unique('UQ_adhoc_chat_room_members_room_user', ['room_id', 'user_id'])
export class AdhocChatRoomMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  room_id: string;

  @ManyToOne(() => AdhocChatRoom, (r) => r.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: AdhocChatRoom;

  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
