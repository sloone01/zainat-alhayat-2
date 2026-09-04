import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RbacRole } from './rbac-role.entity';
import { RbacPage } from './rbac-page.entity';
import { RbacAction } from './rbac-action.entity';

@Entity('rbac_role_permissions')
export class RbacRolePermission {
  @PrimaryColumn('uuid')
  roleId: string;

  @PrimaryColumn()
  pageId: number;

  @PrimaryColumn()
  actionId: number;

  @ManyToOne(() => RbacRole, (r) => r.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: RbacRole;

  @ManyToOne(() => RbacPage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pageId' })
  page: RbacPage;

  @ManyToOne(() => RbacAction, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actionId' })
  action: RbacAction;
}
