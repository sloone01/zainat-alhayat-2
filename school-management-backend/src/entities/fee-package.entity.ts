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
import { FeePackageChargeType } from './fee-package-charge-type.entity';
import { FeePackageDiscountType } from './fee-package-discount-type.entity';
import { FeePackageInstallment } from './fee-package-installment.entity';
import { FeePackageLevelAmount } from './fee-package-level-amount.entity';
import { FeePackageCourseAmount } from './fee-package-course-amount.entity';
import { FeePackageLevelPeriodSetting } from './fee-package-level-period-setting.entity';
import type { CoursePricingBasis } from './course-payment-profile.entity';
import type { YearPaymentMode } from './level-payment-profile.entity';

@Entity('fee_packages')
export class FeePackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  school_id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 3, default: 'OMR' })
  currency: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  year_payment_mode: YearPaymentMode | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  course_pricing_basis: CoursePricingBasis | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @OneToMany(() => FeePackageChargeType, (c) => c.package, { cascade: true })
  chargeTypeLinks: FeePackageChargeType[];

  @OneToMany(() => FeePackageDiscountType, (d) => d.package, { cascade: true })
  discountTypeLinks: FeePackageDiscountType[];

  @OneToMany(() => FeePackageInstallment, (i) => i.package, { cascade: true })
  installments: FeePackageInstallment[];

  @OneToMany(() => FeePackageLevelAmount, (a) => a.package, { cascade: true })
  levelAmounts: FeePackageLevelAmount[];

  @OneToMany(() => FeePackageCourseAmount, (a) => a.package, { cascade: true })
  courseAmounts: FeePackageCourseAmount[];

  @OneToMany(() => FeePackageLevelPeriodSetting, (s) => s.package, { cascade: true })
  levelPeriodSettings: FeePackageLevelPeriodSetting[];
}
