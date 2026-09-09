import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { ErrorTicket } from './error-ticket.entity';
import { ErrorAlertPayload, ErrorAlertService } from './error-alert.service';

export type OpenErrorTicketInput = ErrorAlertPayload;

@Injectable()
export class ErrorTicketService {
  private readonly logger = new Logger(ErrorTicketService.name);

  constructor(
    @InjectRepository(ErrorTicket)
    private readonly repo: Repository<ErrorTicket>,
    private readonly errorAlert: ErrorAlertService,
  ) {}

  /**
   * Allocate a support ticket, write it to logs + `error_tickets`, and email ops.
   * Persist/email failures must never hide the ticket from the user.
   */
  open(payload: OpenErrorTicketInput): string {
    const ticket = this.newTicketId();
    const logLine = `ticket=${ticket} [${payload.source}] ${payload.statusCode ?? '—'} ${payload.message}`;

    if ((payload.statusCode ?? 500) >= 500) {
      this.logger.error(logLine, payload.stack);
    } else {
      this.logger.warn(logLine);
    }

    void this.persist(ticket, payload).catch((err) => {
      this.logger.warn(
        `Failed to persist error ticket ${ticket}: ${err instanceof Error ? err.message : String(err)}`,
      );
    });

    this.errorAlert.notify({ ...payload, ticket });
    return ticket;
  }

  newTicketId(): string {
    const now = new Date();
    const y = String(now.getUTCFullYear()).slice(2);
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    const d = String(now.getUTCDate()).padStart(2, '0');
    const rand = randomBytes(3).toString('hex').toUpperCase();
    return `FIKR-${y}${m}${d}-${rand}`;
  }

  private async persist(ticket: string, payload: OpenErrorTicketInput): Promise<void> {
    const schoolRaw = payload.schoolId;
    const schoolId =
      schoolRaw == null || schoolRaw === ''
        ? null
        : Number.isFinite(Number(schoolRaw))
          ? Number(schoolRaw)
          : null;

    await this.repo.save(
      this.repo.create({
        ticket,
        source: payload.source,
        status_code: payload.statusCode ?? null,
        message: String(payload.message || 'Error').slice(0, 2000),
        stack: payload.stack?.slice(0, 20000) ?? null,
        method: payload.method?.slice(0, 10) ?? null,
        path: (payload.path || payload.url)?.slice(0, 2000) ?? null,
        url: payload.url?.slice(0, 2000) ?? null,
        user_id: payload.userId != null ? String(payload.userId).slice(0, 64) : null,
        school_id: schoolId,
        request_id: payload.requestId?.slice(0, 64) ?? null,
        user_agent: payload.userAgent?.slice(0, 500) ?? null,
        component: payload.component?.slice(0, 200) ?? null,
        extra: payload.extra ?? null,
      }),
    );
  }
}
