import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { RbacGroup } from './rbac-group.entity';

@Entity('rbac_user_group_members')
export class RbacUserGroupMember {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  groupId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => RbacGroup, (g) => g.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: RbacGroup;

  @CreateDateColumn()
  assignedAt: Date;
}
