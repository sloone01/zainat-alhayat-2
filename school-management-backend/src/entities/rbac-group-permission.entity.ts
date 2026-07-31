import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RbacGroup } from './rbac-group.entity';
import { RbacPage } from './rbac-page.entity';
import { RbacAction } from './rbac-action.entity';

@Entity('rbac_group_permissions')
export class RbacGroupPermission {
  @PrimaryColumn('uuid')
  groupId: string;

  @PrimaryColumn()
  pageId: number;

  @PrimaryColumn()
  actionId: number;

  @ManyToOne(() => RbacGroup, (g) => g.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: RbacGroup;

  @ManyToOne(() => RbacPage, (p) => p.groupPermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pageId' })
  page: RbacPage;

  @ManyToOne(() => RbacAction, (a) => a.groupPermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actionId' })
  action: RbacAction;
}
