import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export type PushPlatform = 'ios' | 'android' | 'web';

@Entity('user_push_tokens')
@Index(['user_id'])
@Index(['token'], { unique: true })
export class UserPushToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** FCM registration token (Android / iOS via Capacitor PushNotifications). */
  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'varchar', length: 16 })
  platform: PushPlatform;

  /** Optional stable device id from the client (re-register replaces same device). */
  @Column({ name: 'device_id', type: 'varchar', length: 128, nullable: true })
  device_id: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
