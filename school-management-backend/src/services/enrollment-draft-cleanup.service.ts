import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EnrollmentService } from './enrollment.service';

/** Hourly: delete unfinished public-form enrollment drafts idle ≥ 24h. */
@Injectable()
export class EnrollmentDraftCleanupService {
  private readonly logger = new Logger(EnrollmentDraftCleanupService.name);

  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async purgeStalePublicDrafts() {
    try {
      const n = await this.enrollmentService.purgeStalePublicDrafts(24);
      if (n > 0) {
        this.logger.log(`Purged ${n} stale public enrollment draft(s)`);
      }
    } catch (e) {
      this.logger.warn(`Public enrollment draft purge failed: ${String(e)}`);
    }
  }
}
