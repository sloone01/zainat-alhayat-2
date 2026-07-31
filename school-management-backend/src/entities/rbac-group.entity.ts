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

/**
 * User group (permission role).
 * school_id NULL (or 0) = platform/system group; otherwise school-scoped.
 */
@Entity('rbac_groups')
export class RbacGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

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
