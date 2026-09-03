import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { RbacGroup } from './rbac-group.entity';
import { RbacRole } from './rbac-role.entity';

@Entity('rbac_user_group_roles')
export class RbacUserGroupRole {
  @PrimaryColumn('uuid')
  groupId: string;

  @PrimaryColumn('uuid')
  roleId: string;

  @ManyToOne(() => RbacGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: RbacGroup;

  @ManyToOne(() => RbacRole, (r) => r.groupLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: RbacRole;

  @CreateDateColumn()
  assignedAt: Date;
}
