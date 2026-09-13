import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { School } from './school.entity';
import { User } from './user.entity';
import { FeeTransferLine } from './fee-transfer-line.entity';

export type FeeTransferStatus = 'pending_school' | 'approved' | 'rejected';

@Entity('fee_transfers')
export class FeeTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  school_id: string;

  @Column({ type: 'varchar', length: 24, default: 'pending_school' })
  status: FeeTransferStatus;

  @Column({ type: 'varchar', length: 120, nullable: true })
  reference: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  proof_url: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  proof_original_name: string | null;

  /** Calendar date of the bank / platform transfer (optional for legacy rows). */
  @Column({ type: 'date', nullable: true })
  transferred_at: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  total_amount: string;

  @Column({ type: 'uuid', nullable: true })
  created_by: string | null;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewed_at: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  review_notes: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdByUser: User | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedByUser: User | null;

  @OneToMany(() => FeeTransferLine, (l) => l.transfer, { cascade: true })
  lines: FeeTransferLine[];
}
