import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { School } from './school.entity';
import { User } from './user.entity';
import { Bus } from './bus.entity';
import { AdhocChatRoomMember } from './adhoc-chat-room-member.entity';

export type AdhocChatRoomKind = 'adhoc' | 'bus';

@Entity('adhoc_chat_rooms')
export class AdhocChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  school_id: number;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 16, default: 'adhoc' })
  kind: AdhocChatRoomKind;

  @Column({ type: 'uuid', nullable: true })
  bus_id: string | null;

  @ManyToOne(() => Bus, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'bus_id' })
  bus: Bus | null;

  @Column({ type: 'uuid' })
  created_by_user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User;

  @OneToMany(() => AdhocChatRoomMember, (m) => m.room)
  members: AdhocChatRoomMember[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
