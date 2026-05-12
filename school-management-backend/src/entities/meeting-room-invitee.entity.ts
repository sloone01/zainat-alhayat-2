import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { MeetingRoom } from './meeting-room.entity';

@Entity('meeting_room_invitees')
export class MeetingRoomInvitee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'meeting_room_id' })
  meeting_room_id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @ManyToOne(() => MeetingRoom, (r) => r.invitees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meeting_room_id' })
  meetingRoom: MeetingRoom;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
