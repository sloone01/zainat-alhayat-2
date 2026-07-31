import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { RbacPage } from './rbac-page.entity';
import { RbacAction } from './rbac-action.entity';

export type RbacOverrideEffect = 'grant' | 'deny';

/** Per-user exception on top of group permissions. */
@Entity('rbac_user_permission_overrides')
@Unique(['userId', 'pageId', 'actionId'])
export class RbacUserPermissionOverride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  pageId: number;

  @Column()
  actionId: number;

  @Column({ type: 'varchar', length: 8 })
  effect: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => RbacPage, (p) => p.userOverrides, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pageId' })
  page: RbacPage;

  @ManyToOne(() => RbacAction, (a) => a.userOverrides, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actionId' })
  action: RbacAction;

  @CreateDateColumn()
  createdAt: Date;
}
