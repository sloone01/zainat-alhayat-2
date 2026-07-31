import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RbacPageAction } from './rbac-page-action.entity';
import { RbacGroupPermission } from './rbac-group-permission.entity';
import { RbacUserPermissionOverride } from './rbac-user-permission-override.entity';

@Entity('rbac_actions')
export class RbacAction {
  @PrimaryGeneratedColumn()
  id: number;

  /** Stable code: view | search | create | edit | delete | approve | export | manage */
  @Column({ length: 32, unique: true })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => RbacPageAction, (pa) => pa.action)
  pageActions: RbacPageAction[];

  @OneToMany(() => RbacGroupPermission, (gp) => gp.action)
  groupPermissions: RbacGroupPermission[];

  @OneToMany(() => RbacUserPermissionOverride, (o) => o.action)
  userOverrides: RbacUserPermissionOverride[];
}
