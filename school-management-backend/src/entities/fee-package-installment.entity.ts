import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FeePackage } from './fee-package.entity';

@Entity('fee_package_installments')
export class FeePackageInstallment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'package_id', type: 'uuid' })
  package_id: string;

  @Column({ type: 'int' })
  sequence: number;

  @Column({ type: 'int', nullable: true })
  month_number: number | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  label: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @ManyToOne(() => FeePackage, (p) => p.installments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: FeePackage;
}
