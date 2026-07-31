import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RbacPage } from './rbac-page.entity';
import { RbacAction } from './rbac-action.entity';

/** One-time catalog: which actions a page supports. */
@Entity('rbac_page_actions')
export class RbacPageAction {
  @PrimaryColumn()
  pageId: number;

  @PrimaryColumn()
  actionId: number;

  @ManyToOne(() => RbacPage, (p) => p.pageActions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pageId' })
  page: RbacPage;

  @ManyToOne(() => RbacAction, (a) => a.pageActions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actionId' })
  action: RbacAction;
}
