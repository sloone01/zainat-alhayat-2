import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from './school.entity';
import { RbacRolePermission } from './rbac-role-permission.entity';
import { RbacUserGroupRole } from './rbac-user-group-role.entity';

/**
 * Reusable claim pack. Platform templates have schoolId NULL;
 * school-scoped custom roles may set schoolId.
 */
@Entity('rbac_roles')
export class RbacRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  /** Stable practical code (unique per school scope). */
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** NULL = platform template / system role pack. */
  @Column({ type: 'int', nullable: true })
  schoolId: number | null;

  @ManyToOne(() => School, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School | null;

  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  @Column({ type: 'varchar', length: 64, nullable: true, unique: true })
  systemKey: string | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RbacRolePermission, (p) => p.role)
  permissions: RbacRolePermission[];

  @OneToMany(() => RbacUserGroupRole, (ugr) => ugr.role)
  groupLinks: RbacUserGroupRole[];
}
