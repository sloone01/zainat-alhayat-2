import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  applyNotificationTemplateVariables,
  applyNotificationTemplateVariablesHtml,
  NotificationTemplateService,
} from '../services/notification-template.service';
import { MailService } from '../services/mail.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { isSystemNotificationTemplateKey } from '../constants/notification-template-keys';
import { fikrLogoCidAttachment } from './fikr-logo-file';
import { schoolLogoCidAttachment } from './school-logo-cid';
import { User } from '../entities/user.entity';
import {
  normalizeNotificationLocale,
  resolveRecipientLocale,
} from './notification-locale';
import { runWithOutboundContext } from './outbound-message-context';
import type {
  NotificationChannel,
  NotificationLocale,
  NotifyContentRequest,
  NotifyRecipient,
  NotifyRequest,
  NotifyResult,
} from './notification.types';

@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name);

  constructor(
    private readonly templates: NotificationTemplateService,
    private readonly mail: MailService,
    private readonly sms: SmsService,
    private readonly push: PushService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async notifySafe(request: NotifyRequest): Promise<NotifyResult> {
    try {
      return await this.notify(request);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`notifySafe ${request.templateKey}: ${msg}`);
      return { emailSent: 0, smsSent: 0, pushQueued: 0, skipped: 0, errors: [msg] };
    }
  }

  async notify(request: NotifyRequest): Promise<NotifyResult> {
    const fallbackLocale = normalizeNotificationLocale(request.locale, 'ar');
    const groups = await this.groupRecipientsByLocale(request.recipients, fallbackLocale);
    const merged: NotifyResult = {
      emailSent: 0,
      smsSent: 0,
      pushQueued: 0,
      skipped: 0,
      errors: [],
    };

    for (const [locale, recipients] of groups) {
      const part = await this.notifyForLocale({ ...request, locale, recipients });
      merged.emailSent += part.emailSent;
      merged.smsSent += part.smsSent;
      merged.pushQueued += part.pushQueued;
      merged.skipped += part.skipped;
      merged.errors.push(...part.errors);
    }
    return merged;
  }

  private async notifyForLocale(request: NotifyRequest & { locale: NotificationLocale }): Promise<NotifyResult> {
    const locale = request.locale;
    const isSystem = isSystemNotificationTemplateKey(request.templateKey);
    const resolved = await this.templates.resolveForSend(
      request.schoolId,
      request.templateKey,
      locale,
    );
    const branding = isSystem
      ? await this.templates.getPlatformBranding(locale, { logoSrc: 'cid' })
      : await this.templates.getSchoolBranding(request.schoolId, { logoSrc: 'cid' });
    const variables = this.templates.applySchoolBranding(request.variables, branding, {
      preserveContentSchoolName: isSystem,
    });
    const logo = isSystem
      ? fikrLogoCidAttachment()
      : await schoolLogoCidAttachment(branding.schoolLogo);
    if (isSystem && !logo) {
      this.logger.warn('FIKR logo file missing — system email will use a remote logo URL');
    }
    if (!isSystem && branding.schoolLogo && !logo) {
      this.logger.warn('School logo could not be inlined as CID — remote URL may not render in Gmail');
    }
    return this.dispatchContent({
      subject: applyNotificationTemplateVariables(resolved.subject, variables),
      html: applyNotificationTemplateVariablesHtml(resolved.body_html, variables),
      smsBody: applyNotificationTemplateVariables(resolved.body_sms, variables),
      recipients: request.recipients,
      channels: request.channels?.length
        ? request.channels
        : this.channelsFromTemplate(await this.templates.getChannel(request.templateKey)),
      attachments: logo
        ? [...(request.attachments ?? []), logo]
        : request.attachments,
      schoolId: request.schoolId,
      templateKey: request.templateKey,
      source: 'dispatcher',
    });
  }

  async notifyContentSafe(request: NotifyContentRequest): Promise<NotifyResult> {
    try {
      return await this.notifyContent(request);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`notifyContentSafe: ${msg}`);
      return { emailSent: 0, smsSent: 0, pushQueued: 0, skipped: 0, errors: [msg] };
    }
  }

  async notifyContent(request: NotifyContentRequest): Promise<NotifyResult> {
    let attachments = request.attachments;
    if (!attachments?.length && request.schoolId) {
      const branding = await this.templates.getSchoolBranding(request.schoolId, { logoSrc: 'cid' });
      const logo = await schoolLogoCidAttachment(branding.schoolLogo);
      if (logo) attachments = [logo];
    }
    return this.dispatchContent({
      subject: request.subject,
      html: request.bodyHtml,
      smsBody: request.bodySms ?? '',
      recipients: request.recipients,
      channels: request.channels,
      attachments,
      schoolId: request.schoolId,
      templateKey: null,
      source: 'content',
    });
  }

  /** Resolve preferred language for a user id (defaults to Arabic). */
  async resolveUserPreferredLocale(userId?: string | null): Promise<NotificationLocale> {
    const id = userId?.trim();
    if (!id) return 'ar';
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'preferred_language'] as any,
    });
    return normalizeNotificationLocale(user?.preferred_language, 'ar');
  }

  private async groupRecipientsByLocale(
    recipients: NotifyRecipient[],
    fallback: NotificationLocale,
  ): Promise<Map<NotificationLocale, NotifyRecipient[]>> {
    const userIds = [
      ...new Set(
        recipients
          .map((r) => r.userId?.trim())
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const preferred = new Map<string, NotificationLocale>();
    if (userIds.length) {
      const users = await this.userRepo.find({
        where: { id: In(userIds) },
        select: ['id', 'preferred_language'] as any,
      });
      for (const u of users) {
        preferred.set(u.id, normalizeNotificationLocale(u.preferred_language, 'ar'));
      }
    }

    const groups = new Map<NotificationLocale, NotifyRecipient[]>();
    for (const recipient of recipients) {
      const locale = resolveRecipientLocale({
        recipientLocale: recipient.locale,
        preferredLanguage: recipient.userId
          ? preferred.get(recipient.userId) ?? null
          : null,
        requestLocale: fallback,
      });
      const list = groups.get(locale) ?? [];
      list.push({ ...recipient, locale });
      groups.set(locale, list);
    }
    return groups;
  }

  private async dispatchContent(input: {
    subject: string;
    html: string;
    smsBody: string;
    recipients: NotifyRecipient[];
    channels: NotificationChannel[];
    attachments?: NotifyRequest['attachments'];
    schoolId?: string | null;
    templateKey?: string | null;
    source?: string | null;
  }): Promise<NotifyResult> {
    const result: NotifyResult = {
      emailSent: 0,
      smsSent: 0,
      pushQueued: 0,
      skipped: 0,
      errors: [],
    };
    const seenEmail = new Set<string>();
    const seenPhone = new Set<string>();
    const seenUser = new Set<string>();

    for (const recipient of input.recipients) {
      const delivered = await this.deliverToRecipient({
        recipient,
        channels: input.channels,
        subject: input.subject,
        html: input.html,
        smsBody: input.smsBody,
        attachments: input.attachments,
        schoolId: input.schoolId ?? null,
        templateKey: input.templateKey ?? null,
        source: input.source ?? null,
        result,
        seenEmail,
        seenPhone,
        seenUser,
      });
      if (!delivered) result.skipped += 1;
    }

    return result;
  }

  private channelsFromTemplate(channel: string | null): NotificationChannel[] {
    const out: NotificationChannel[] = ['push'];
    if (channel === 'sms') {
      out.unshift('sms');
    } else if (channel === 'email') {
      out.unshift('email', 'sms');
    } else {
      out.unshift('email', 'sms');
    }
    return out;
  }

  private async deliverToRecipient(input: {
    recipient: NotifyRecipient;
    channels: NotificationChannel[];
    subject: string;
    html: string;
    smsBody: string;
    attachments?: NotifyRequest['attachments'];
    schoolId?: string | null;
    templateKey?: string | null;
    source?: string | null;
    result: NotifyResult;
    seenEmail: Set<string>;
    seenPhone: Set<string>;
    seenUser: Set<string>;
  }): Promise<boolean> {
    let any = false;
    const { recipient, channels, result } = input;
    const ctxBase = {
      schoolId: input.schoolId ?? null,
      templateKey: input.templateKey ?? null,
      recipientUserId: recipient.userId ?? null,
      source: input.source ?? 'dispatcher',
    };

    if (channels.includes('email')) {
      const email = recipient.email?.trim();
      if (email && !input.seenEmail.has(email.toLowerCase())) {
        input.seenEmail.add(email.toLowerCase());
        if (this.mail.isConfigured() && input.html.trim()) {
          try {
            await runWithOutboundContext(ctxBase, () =>
              this.mail.sendMail({
                to: email,
                subject: input.subject,
                html: input.html,
                attachments: input.attachments,
              }),
            );
            result.emailSent += 1;
            any = true;
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            result.errors.push(`email ${email}: ${msg}`);
            this.logger.error(`Email failed for ${email}: ${msg}`);
          }
        } else if (!this.mail.isConfigured()) {
          this.logger.warn(`SMTP not configured — email skipped for ${email}`);
        }
      }
    }

    if (channels.includes('sms')) {
      const phone = recipient.phone?.trim();
      if (phone && !input.seenPhone.has(phone)) {
        input.seenPhone.add(phone);
        if (input.smsBody.trim()) {
          try {
            await runWithOutboundContext(ctxBase, () =>
              this.sms.sendSms({ to: phone, body: input.smsBody }),
            );
            result.smsSent += 1;
            any = true;
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            result.errors.push(`sms ${phone}: ${msg}`);
            this.logger.error(`SMS failed for ${phone}: ${msg}`);
          }
        }
      }
    }

    if (channels.includes('push')) {
      const userId = recipient.userId?.trim();
      if (userId && !input.seenUser.has(userId)) {
        input.seenUser.add(userId);
        try {
          await this.push.sendPush({
            userId,
            title: input.subject || 'Notification',
            body: input.smsBody || input.subject,
          });
          result.pushQueued += 1;
          any = true;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          result.errors.push(`push ${userId}: ${msg}`);
        }
      }
    }

    return any;
  }
}
