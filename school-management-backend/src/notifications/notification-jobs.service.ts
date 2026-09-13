import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentChargeSheetInstallment } from '../entities/student-charge-sheet-installment.entity';
import { NotificationSendLog } from '../entities/notification-send-log.entity';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import { NotificationAudienceService } from './notification-audience.service';
import { NotificationDispatcherService } from './notification-dispatcher.service';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const START_DELAY_MS = 20_000;

function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

function moneyStr(n: number): string {
  return n.toFixed(2);
}

@Injectable()
export class NotificationJobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationJobsService.name);
  private interval: ReturnType<typeof setInterval> | null = null;
  private startTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    @InjectRepository(StudentChargeSheetInstallment)
    private readonly instRepo: Repository<StudentChargeSheetInstallment>,
    @InjectRepository(NotificationSendLog)
    private readonly sendLogRepo: Repository<NotificationSendLog>,
    private readonly audience: NotificationAudienceService,
    private readonly notifications: NotificationDispatcherService,
  ) {}

  onModuleInit(): void {
    this.startTimer = setTimeout(() => {
      void this.runInstallmentReminders();
    }, START_DELAY_MS);
    this.interval = setInterval(() => {
      void this.runInstallmentReminders();
    }, SIX_HOURS_MS);
  }

  onModuleDestroy(): void {
    if (this.startTimer) clearTimeout(this.startTimer);
    if (this.interval) clearInterval(this.interval);
  }

  async runInstallmentReminders(): Promise<void> {
    const asOf = todayYmd();
    try {
      const rows = await this.instRepo
        .createQueryBuilder('i')
        .innerJoinAndSelect('i.sheet', 's')
        .where('i.status IN (:...statuses)', { statuses: ['pending', 'partial'] })
        .andWhere('i.due_date IS NOT NULL')
        .andWhere('CAST(i.amount_due AS decimal) > CAST(i.amount_paid AS decimal)')
        .andWhere('i.due_date <= :asOf', { asOf })
        .getMany();

      for (const inst of rows) {
        const dueDate = inst.due_date ? String(inst.due_date).slice(0, 10) : null;
        if (!dueDate) continue;
        const templateKey =
          dueDate < asOf
            ? NOTIFICATION_TEMPLATE_KEYS.PAYMENT_INSTALLMENT_LATE
            : NOTIFICATION_TEMPLATE_KEYS.PAYMENT_INSTALLMENT_DUE;
        const already = await this.sendLogRepo.findOne({
          where: { template_key: templateKey, entity_id: inst.id, sent_on: asOf },
        });
        if (already) continue;

        const schoolId = inst.sheet?.school_id ?? null;
        const studentId = inst.sheet?.student_id;
        if (!studentId) continue;
        const { studentName, recipients } = await this.audience.parentsOfStudent(studentId);
        if (!recipients.length) continue;

        const amountDue = Number(inst.amount_due) || 0;
        const amountPaid = Number(inst.amount_paid) || 0;
        await this.notifications.notifySafe({
          schoolId,
          templateKey,
          locale: 'ar',
          variables: {
            studentName,
            recipientName: recipients[0]?.name || 'ولي الأمر',
            date: dueDate,
            amount: moneyStr(Math.max(0, amountDue - amountPaid)),
            currency: inst.sheet?.currency || 'OMR',
            notes: inst.label || '',
          },
          recipients,
        });
        await this.sendLogRepo.save(
          this.sendLogRepo.create({
            template_key: templateKey,
            entity_id: inst.id,
            school_id: schoolId,
            sent_on: asOf,
          }),
        );
      }
    } catch (err) {
      this.logger.error('Installment reminder job failed', err as Error);
    }
  }
}
