import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RbacPageAction } from './rbac-page-action.entity';
import { RbacGroupPermission } from './rbac-group-permission.entity';
import { RbacUserPermissionOverride } from './rbac-user-permission-override.entity';

export type RbacPageScope = 'platform' | 'school' | 'both';

@Entity('rbac_pages')
export class RbacPage {
  @PrimaryGeneratedColumn()
  id: number;

  /** Stable key, e.g. students, enrollments */
  @Column({ length: 64, unique: true })
  key: string;

  @Column({ length: 255 })
  route: string;

  @Column({ length: 120 })
  nameEn: string;

  @Column({ length: 120 })
  nameAr: string;

  @Column({ type: 'varchar', length: 16, default: 'school' })
  scope: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => RbacPageAction, (pa) => pa.page)
  pageActions: RbacPageAction[];

  @OneToMany(() => RbacGroupPermission, (gp) => gp.page)
  groupPermissions: RbacGroupPermission[];

  @OneToMany(() => RbacUserPermissionOverride, (o) => o.page)
  userOverrides: RbacUserPermissionOverride[];
}
