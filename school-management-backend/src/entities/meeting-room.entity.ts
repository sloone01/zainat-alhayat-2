import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { MeetingRoomInvitee } from './meeting-room-invitee.entity';

@Entity('meeting_rooms')
export class MeetingRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'int' })
  school_id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 32, default: 'daily' })
  provider: string;

  @Column({ length: 128 })
  room_name: string;

  @Column({ type: 'text' })
  room_url: string;

  @Column({ name: 'created_by' })
  created_by: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  /** When the meeting is intended to start (admin-chosen local instant stored as UTC). */
  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduled_at: Date | null;

  @ManyToOne(() => User, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => MeetingRoomInvitee, (i) => i.meetingRoom)
  invitees: MeetingRoomInvitee[];
}
