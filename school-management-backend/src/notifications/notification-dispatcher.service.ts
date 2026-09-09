import { Injectable, Logger } from '@nestjs/common';
import {
  applyNotificationTemplateVariables,
  applyNotificationTemplateVariablesHtml,
  NotificationTemplateService,
} from '../services/notification-template.service';
import { MailService } from '../services/mail.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { isSystemNotificationTemplateKey } from '../constants/notification-template-keys';
import type {
  NotificationChannel,
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
    const locale = request.locale === 'en' ? 'en' : 'ar';
    const isSystem = isSystemNotificationTemplateKey(request.templateKey);
    const resolved = await this.templates.resolveForSend(
      request.schoolId,
      request.templateKey,
      locale,
    );
    const branding = isSystem
      ? await this.templates.getPlatformBranding(locale)
      : await this.templates.getSchoolBranding(request.schoolId);
    const variables = this.templates.applySchoolBranding(request.variables, branding, {
      preserveContentSchoolName: isSystem,
    });
    return this.dispatchContent({
      subject: applyNotificationTemplateVariables(resolved.subject, variables),
      html: applyNotificationTemplateVariablesHtml(resolved.body_html, variables),
      smsBody: applyNotificationTemplateVariables(resolved.body_sms, variables),
      recipients: request.recipients,
      channels: request.channels?.length
        ? request.channels
        : this.channelsFromTemplate(await this.templates.getChannel(request.templateKey)),
      attachments: request.attachments,
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
    return this.dispatchContent({
      subject: request.subject,
      html: request.bodyHtml,
      smsBody: request.bodySms ?? '',
      recipients: request.recipients,
      channels: request.channels,
      attachments: request.attachments,
    });
  }

  private async dispatchContent(input: {
    subject: string;
    html: string;
    smsBody: string;
    recipients: NotifyRecipient[];
    channels: NotificationChannel[];
    attachments?: NotifyRequest['attachments'];
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
      // Seed data is often email-only; still attempt SMS when body_sms is filled
      // (empty SMS is skipped in deliverToRecipient).
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
    result: NotifyResult;
    seenEmail: Set<string>;
    seenPhone: Set<string>;
    seenUser: Set<string>;
  }): Promise<boolean> {
    let any = false;
    const { recipient, channels, result } = input;

    if (channels.includes('email')) {
      const email = recipient.email?.trim();
      if (email && !input.seenEmail.has(email.toLowerCase())) {
        input.seenEmail.add(email.toLowerCase());
        if (this.mail.isConfigured() && input.html.trim()) {
          try {
            await this.mail.sendMail({
              to: email,
              subject: input.subject,
              html: input.html,
              attachments: input.attachments,
            });
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
            await this.sms.sendSms({ to: phone, body: input.smsBody });
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
