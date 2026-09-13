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

  @Column({ name: 'school_id', type: 'uuid' })
  school_id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 32, default: 'daily' })
  provider: string;

  @Column({ name: 'status', type: 'varchar', length: 24, default: 'scheduled' })
  status: 'draft' | 'scheduled';

  @Column({ name: 'invite_spec', type: 'jsonb', nullable: true })
  invite_spec: Record<string, unknown> | null;

  @Column({ name: 'room_name', type: 'varchar', length: 128, nullable: true })
  room_name: string | null;

  @Column({ name: 'room_url', type: 'text', nullable: true })
  room_url: string | null;

  @Column({ name: 'created_by' })
  created_by: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  /** When the meeting is intended to start (admin-chosen local instant stored as UTC). */
  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduled_at: Date | null;

  /** Set when staff first opens the Daily room; invitees may join after this. */
  @Column({ name: 'opened_at', type: 'timestamptz', nullable: true })
  opened_at: Date | null;

  @Column({ name: 'opened_by', type: 'uuid', nullable: true })
  opened_by: string | null;

  /** Set when staff leave/end the live room; invitees can no longer join. */
  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  ended_at: Date | null;

  @ManyToOne(() => User, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => MeetingRoomInvitee, (i) => i.meetingRoom)
  invitees: MeetingRoomInvitee[];
}
