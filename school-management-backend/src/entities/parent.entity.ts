import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Student } from './student.entity';

@Entity('parents')
export class Parent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  /**
   * Owning school. Parents used to be scoped only via their linked user account, which
   * left user-less parent records visible to (and editable by) every school.
   */
  @Column({ type: 'int', nullable: true })
  school_id: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.parents, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Student, student => student.parents)
  students: Student[];

  /**
   * Legacy snake_case duplicates of createdAt/updatedAt. TypeORM allows only one
   * create/update date column per entity — declaring two made it write `{}` into every
   * timestamp on update (and serialise them as `{}` in API responses), so these are
   * plain columns left to the database defaults.
   */
  @Column({ type: 'timestamp', default: () => 'now()', update: false, select: false })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'now()', update: false, select: false })
  updated_at: Date;
}

