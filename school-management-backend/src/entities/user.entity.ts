import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from './staff.entity';
import { Parent } from './parent.entity';
import { Reminder } from './reminder.entity';
import { School } from './school.entity';
import { Schedule } from './schedule.entity';
import { WeeklySessionPlan } from './weekly-session-plan.entity';
import { SessionMedia } from './session-media.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true, nullable: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ 
    type: 'enum',
    enum: ['admin', 'teacher', 'student', 'parent'],
    default: 'student'
  })
  role: 'admin' | 'teacher' | 'student' | 'parent';

  /**
   * Account kind for access rules.
   * staff → assignable school user groups; parent/student → one static system group;
   * platform → platform groups only.
   */
  @Column({
    name: 'user_type',
    type: 'enum',
    enum: ['staff', 'parent', 'student', 'platform'],
    default: 'student',
  })
  user_type: 'staff' | 'parent' | 'student' | 'platform';

  @Column({ type: 'text', nullable: true })
  roles: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @ManyToOne(() => School, { nullable: true })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ nullable: true })
  school_id: number;

  /**
   * Platform/system account (no school). Prefer school_id IS NULL;
   * school_id = 0 is normalized to NULL on write.
   */
  @Column({ name: 'is_system_user', default: false })
  isSystemUser: boolean;

  /** Single platform owner; bypasses claim checks when true. */
  @Column({ name: 'is_super_admin', default: false })
  isSuperAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Staff, staff => staff.user)
  staff: Staff[];

  @OneToMany(() => Parent, parent => parent.user)
  parents: Parent[];

  @OneToMany(() => Reminder, reminder => reminder.user)
  reminders: Reminder[];

  @OneToMany(() => Schedule, schedule => schedule.teacher)
  schedules: Schedule[];

  @OneToMany(() => WeeklySessionPlan, weeklySessionPlan => weeklySessionPlan.createdBy)
  weeklySessionPlans: WeeklySessionPlan[];

  @OneToMany(() => SessionMedia, media => media.uploadedByUser)
  uploadedMedia: SessionMedia[];
}

