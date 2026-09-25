import { Injectable, Logger } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { DirectChatService } from '../chat/direct-chat.service';
import { formatStudentDisplayName } from '../common/identity/bilingual-name';
import {
  isParentOrStudentActor,
  isPlatformActor,
  resolveActorSchoolId,
} from '../common/security/school-access';
import { AbsenceExcuse } from '../entities/absence-excuse.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { FeeTransfer } from '../entities/fee-transfer.entity';
import { School } from '../entities/school.entity';
import { StudentFeePayment } from '../entities/student-fee-payment.entity';
import { SupportRequest } from '../entities/support-request.entity';
import { User } from '../entities/user.entity';
import { PlatformCustomPlanRequest } from '../platform-billing/entities/platform-custom-plan-request.entity';
import { RbacPermissionService } from '../rbac/rbac-permission.service';

/** One pending action. `href` is a SPA path the bell opens. */
export type AttentionItem = {
  id: string;
  kind: string;
  title: string;
  href: string;
  created_at: string;
};

export type AttentionFeed = {
  items: AttentionItem[];
  total: number;
};

const LIST_CAP = 25;
const SOURCE_CAP = 20;

type Bucket = { total: number; items: AttentionItem[] };

const EMPTY_BUCKET: Bucket = { total: 0, items: [] };

/**
 * Pending work the signed-in person can act on.
 * Add a source by pushing another claim-gated bucket — the bell only needs `href`.
 */
@Injectable()
export class AttentionService {
  private readonly logger = new Logger(AttentionService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly permissions: RbacPermissionService,
    private readonly directChat: DirectChatService,
  ) {}

  async list(user: User, locale: string): Promise<AttentionFeed> {
    const loc = locale === 'en' ? 'en' : 'ar';
    if (isParentOrStudentActor(user)) {
      if (user.user_type === 'student' || user.role === 'student') {
        return { items: [], total: 0 };
      }
      return this.pack([await this.safe(() => this.approvals(user, loc))]);
    }
    if (isPlatformActor(user)) {
      return this.pack(
        await Promise.all([
          this.safe(() => this.pendingSchools(loc)),
          this.safe(() => this.customPlans(loc)),
          this.safe(() => this.openSupport()),
        ]),
      );
    }
    if (user.school?.status === 'pending_payment') {
      return this.pack([this.billingItem(user, loc)]);
    }

    let schoolId: string | null = null;
    try {
      schoolId = resolveActorSchoolId(user);
    } catch {
      schoolId = null;
    }
    if (!schoolId) return { items: [], total: 0 };

    const [enrollments, receipts, transfers, excuses, approvals] = await Promise.all([
      this.safe(() => this.enrollments(user, schoolId!)),
      this.safe(() => this.receipts(user, schoolId!, loc)),
      this.safe(() => this.transfers(user, schoolId!)),
      this.safe(() => this.excuses(user, schoolId!, loc)),
      this.safe(() => this.staffApprovals(user, loc)),
    ]);
    return this.pack([enrollments, receipts, transfers, excuses, approvals]);
  }

  private pack(buckets: Bucket[]): AttentionFeed {
    const total = buckets.reduce((sum, bucket) => sum + bucket.total, 0);
    const items = buckets
      .flatMap((bucket) => bucket.items)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0))
      .slice(0, LIST_CAP);
    return { items, total };
  }

  private async safe(load: () => Promise<Bucket>): Promise<Bucket> {
    try {
      return await load();
    } catch (err) {
      this.logger.warn(`Attention source skipped: ${(err as Error).message}`);
      return EMPTY_BUCKET;
    }
  }

  private async can(user: User, page: string, action = 'view'): Promise<boolean> {
    if (user.isSuperAdmin || user.isSystemUser) return true;
    return this.permissions.hasClaim(user.id, page, action);
  }

  private billingItem(user: User, locale: string): Bucket {
    const name = this.schoolLabel(user.school, locale);
    return {
      total: 1,
      items: [
        {
          id: 'school-billing',
          kind: 'school_billing',
          title: name,
          href: '/billing',
          created_at: this.iso(user.school?.created_at),
        },
      ],
    };
  }

  private async enrollments(user: User, schoolId: string): Promise<Bucket> {
    if (!(await this.can(user, 'enrollments'))) return EMPTY_BUCKET;
    const repo = this.dataSource.getRepository(Enrollment);
    const base = () =>
      repo.createQueryBuilder('e').where('e.status = :status', { status: 'pending' }).andWhere('e.school_id = :schoolId', { schoolId });
    const total = await base().getCount();
    if (!total) return EMPTY_BUCKET;
    const rows = await base().orderBy('e.createdAt', 'DESC').take(SOURCE_CAP).getMany();
    return {
      total,
      items: rows.map((row) => ({
        id: `enrollment:${row.id}`,
        kind: 'enrollment',
        title: (row.fullName || '').trim(),
        href: `/enrollments/${row.id}`,
        created_at: this.iso(row.createdAt),
      })),
    };
  }

  private async receipts(user: User, schoolId: string, locale: string): Promise<Bucket> {
    if (user.role !== 'admin') return EMPTY_BUCKET;
    if (!(await this.can(user, 'student_payments'))) return EMPTY_BUCKET;
    const repo = this.dataSource.getRepository(StudentFeePayment);
    const base = () =>
      repo
        .createQueryBuilder('p')
        .where('p.school_id = :schoolId', { schoolId })
        .andWhere('p.status IN (:...statuses)', { statuses: ['pending_approval', 'pending_reconcile'] })
        .andWhere('p.method IN (:...methods)', { methods: ['offline', 'admin'] });
    const totalRaw = await base()
      .select('COUNT(DISTINCT COALESCE(p.payment_id, p.id))', 'n')
      .getRawOne<{ n: string }>();
    const total = Number(totalRaw?.n || 0);
    if (!total) return EMPTY_BUCKET;
    const rows = await base()
      .leftJoinAndSelect('p.student', 'student')
      .orderBy('p.created_at', 'DESC')
      .take(SOURCE_CAP * 3)
      .getMany();
    const seen = new Set<string>();
    const items: AttentionItem[] = [];
    for (const row of rows) {
      const key = row.payment_id || row.id;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({
        id: `fee_receipt:${key}`,
        kind: 'fee_receipt',
        title: formatStudentDisplayName(row.student, locale),
        href: '/students/payments/pending-receipts',
        created_at: this.iso(row.created_at),
      });
      if (items.length >= SOURCE_CAP) break;
    }
    return { total, items };
  }

  private async transfers(user: User, schoolId: string): Promise<Bucket> {
    if (user.role !== 'admin') return EMPTY_BUCKET;
    if (!(await this.can(user, 'student_payments'))) return EMPTY_BUCKET;
    const repo = this.dataSource.getRepository(FeeTransfer);
    const where = { school_id: schoolId, status: 'pending_school' as const };
    const total = await repo.count({ where });
    if (!total) return EMPTY_BUCKET;
    const rows = await repo.find({
      where,
      order: { created_at: 'DESC' },
      take: SOURCE_CAP,
    });
    return {
      total,
      items: rows.map((row) => ({
        id: `fee_transfer:${row.id}`,
        kind: 'fee_transfer',
        title: this.transferTitle(row),
        href: '/students/payments/pending-transfers',
        created_at: this.iso(row.created_at),
      })),
    };
  }

  private async excuses(user: User, schoolId: string, locale: string): Promise<Bucket> {
    if (!(await this.can(user, 'absence_excuses'))) return EMPTY_BUCKET;
    const repo = this.dataSource.getRepository(AbsenceExcuse);
    const base = () =>
      repo
        .createQueryBuilder('excuse')
        .where('excuse.school_id = :schoolId', { schoolId })
        .andWhere('excuse.status = :status', { status: 'pending' });
    const total = await base().getCount();
    if (!total) return EMPTY_BUCKET;
    const rows = await base()
      .leftJoinAndSelect('excuse.student', 'student')
      .orderBy('excuse.created_at', 'DESC')
      .take(SOURCE_CAP)
      .getMany();
    return {
      total,
      items: rows.map((row) => ({
        id: `absence_excuse:${row.id}`,
        kind: 'absence_excuse',
        title: formatStudentDisplayName(row.student, locale),
        href: '/attendance/excuses',
        created_at: this.iso(row.created_at),
      })),
    };
  }

  private async staffApprovals(user: User, locale: string): Promise<Bucket> {
    if (!(await this.can(user, 'approvals'))) return EMPTY_BUCKET;
    return this.approvals(user, locale);
  }

  private async approvals(user: User, locale: string): Promise<Bucket> {
    const rows = await this.directChat.listApprovalInbox(user, locale === 'en' ? 'en' : 'ar');
    const pending = rows.filter((row) => row.can_approve && row.approval_status === 'pending');
    return {
      total: pending.length,
      items: pending.slice(0, SOURCE_CAP).map((row) => ({
        id: `approval:${row.message_id}`,
        kind: 'approval',
        title: (row.activity_title || row.title || '').trim(),
        href: '/approvals',
        created_at: this.iso(row.sent_at),
      })),
    };
  }

  private async pendingSchools(locale: string): Promise<Bucket> {
    const repo = this.dataSource.getRepository(School);
    const where = { status: 'pending' as const };
    const total = await repo.count({ where });
    if (!total) return EMPTY_BUCKET;
    const rows = await repo.find({
      where,
      order: { created_at: 'DESC' },
      take: SOURCE_CAP,
    });
    return {
      total,
      items: rows.map((row) => ({
        id: `school_registration:${row.id}`,
        kind: 'school_registration',
        title: this.schoolLabel(row, locale),
        href: `/platform/schools/${row.id}`,
        created_at: this.iso(row.created_at),
      })),
    };
  }

  private async customPlans(locale: string): Promise<Bucket> {
    const repo = this.dataSource.getRepository(PlatformCustomPlanRequest);
    const where = { status: 'new' as const };
    const total = await repo.count({ where });
    if (!total) return EMPTY_BUCKET;
    const rows = await repo.find({
      where,
      order: { created_at: 'DESC' },
      take: SOURCE_CAP,
    });
    return {
      total,
      items: rows.map((row) => ({
        id: `custom_plan:${row.id}`,
        kind: 'custom_plan',
        title: this.pickLabel(locale, row.school_name_ar, row.school_name_en, row.school_name),
        href: `/platform/custom-plan-requests/${row.id}`,
        created_at: this.iso(row.created_at),
      })),
    };
  }

  private async openSupport(): Promise<Bucket> {
    const repo = this.dataSource.getRepository(SupportRequest);
    const where = { status: In(['open', 'in_progress'] as const) };
    const total = await repo.count({ where });
    if (!total) return EMPTY_BUCKET;
    const rows = await repo.find({
      where,
      order: { created_at: 'DESC' },
      take: SOURCE_CAP,
    });
    return {
      total,
      items: rows.map((row) => ({
        id: `support:${row.id}`,
        kind: 'support',
        title: (row.title || '').trim(),
        href: '/platform/support-requests',
        created_at: this.iso(row.created_at),
      })),
    };
  }

  private transferTitle(row: FeeTransfer): string {
    const ref = (row.reference || '').trim();
    if (ref) return ref;
    const amount = Number(row.total_amount);
    if (Number.isFinite(amount) && amount > 0) return amount.toFixed(3);
    return '';
  }

  private schoolLabel(school: School | null | undefined, locale: string): string {
    if (!school) return '';
    return this.pickLabel(locale, school.name_ar, school.name_en, school.name);
  }

  private pickLabel(locale: string, ar?: string | null, en?: string | null, legacy?: string | null): string {
    const preferAr = locale !== 'en';
    const a = (ar || '').trim();
    const e = (en || '').trim();
    const l = (legacy || '').trim();
    if (preferAr) return a || e || l;
    return e || a || l;
  }

  private iso(value: Date | string | null | undefined): string {
    if (!value) return new Date(0).toISOString();
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
  }
}
