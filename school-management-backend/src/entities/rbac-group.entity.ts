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
import { RbacGroupPermission } from './rbac-group-permission.entity';
import { RbacUserGroupMember } from './rbac-user-group-member.entity';

export type RbacGroupType = 'system' | 'staff' | 'parent' | 'student';

/**
 * User group (job / persona pack).
 * school_id NULL = platform-scoped; otherwise school-scoped.
 */
@Entity('rbac_groups')
export class RbacGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  /**
   * Stable practical code (unique per school scope).
   * e.g. school_admin, teacher, finance, student, parent, super_admin
   */
  @Column({ type: 'varchar', length: 64 })
  code: string;

  /**
   * Persona/job category for the group.
   * system = platform operators; staff = school jobs; parent/student = static packs.
   */
  @Column({
    type: 'enum',
    enum: ['system', 'staff', 'parent', 'student'],
    default: 'staff',
  })
  groupType: RbacGroupType;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** NULL = system/platform group. Never use a fake school row. */
  @Column({ type: 'int', nullable: true })
  schoolId: number | null;

  @ManyToOne(() => School, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School | null;

  /** Built-in groups that cannot be deleted (e.g. Super Admin). */
  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  /** Stable key for seeded groups: super_admin, school_manager, … */
  @Column({ type: 'varchar', length: 64, nullable: true, unique: true })
  systemKey: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  color: string | null;

  @Column({ type: 'uuid', nullable: true })
  clonedFromId: string | null;

  @ManyToOne(() => RbacGroup, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'clonedFromId' })
  clonedFrom: RbacGroup | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RbacGroupPermission, (gp) => gp.group)
  permissions: RbacGroupPermission[];

  @OneToMany(() => RbacUserGroupMember, (m) => m.group)
  members: RbacUserGroupMember[];
}
