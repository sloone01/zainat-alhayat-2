import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type InfobipEmailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
  cid?: string;
};

@Injectable()
export class InfobipClient {
  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey());
  }

  baseUrl(): string {
    const raw =
      this.config.get<string>('INFOBIP_BASE_URL')?.trim() || 'https://api.infobip.com';
    const trimmed = raw.replace(/\/+$/, '');
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  smsFrom(): string {
    return this.config.get<string>('INFOBIP_SMS_FROM')?.trim() || 'FIKR';
  }

  whatsappFrom(): string | null {
    const raw = this.config.get<string>('INFOBIP_WHATSAPP_FROM')?.trim();
    return raw ? this.digits(raw) : null;
  }

  private apiKey(): string | null {
    return this.config.get<string>('INFOBIP_API_KEY')?.trim() || null;
  }

  private authHeaders(json = true): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `App ${this.apiKey()}`,
      Accept: 'application/json',
    };
    if (json) headers['Content-Type'] = 'application/json';
    return headers;
  }

  async sendEmail(input: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: InfobipEmailAttachment[];
  }): Promise<{ messageId: string | null }> {
    const form = new FormData();
    form.append('from', input.from);
    form.append('to', input.to);
    form.append('subject', input.subject);
    form.append('html', input.html);
    if (input.text) form.append('text', input.text);
    for (const att of input.attachments ?? []) {
      const blob = new Blob([new Uint8Array(att.content)], {
        type: att.contentType || 'application/octet-stream',
      });
      if (att.cid) {
        form.append('inlineImage', blob, att.cid);
      } else {
        form.append('attachment', blob, att.filename);
      }
    }
    const data = await this.requestJson('POST', '/email/3/send', form);
    return { messageId: this.firstMessageId(data) };
  }

  async sendSms(input: { to: string; body: string }): Promise<{ messageId: string | null }> {
    const data = await this.requestJson('POST', '/sms/2/text/advanced', {
      messages: [
        {
          from: this.smsFrom(),
          destinations: [{ to: this.digits(input.to) }],
          text: input.body,
        },
      ],
    });
    return { messageId: this.firstMessageId(data) };
  }

  async sendWhatsAppText(input: { to: string; body: string }): Promise<{ messageId: string | null }> {
    const from = this.whatsappFrom();
    if (!from) throw new Error('INFOBIP_WHATSAPP_FROM is not set');
    const data = await this.requestJson('POST', '/whatsapp/1/message/text', {
      from,
      to: this.digits(input.to),
      content: { text: input.body },
    });
    return { messageId: this.firstMessageId(data) };
  }

  async sendWhatsAppDocument(input: {
    to: string;
    mediaUrl: string;
    filename: string;
    caption?: string;
  }): Promise<{ messageId: string | null }> {
    const from = this.whatsappFrom();
    if (!from) throw new Error('INFOBIP_WHATSAPP_FROM is not set');
    const content: Record<string, string> = {
      mediaUrl: input.mediaUrl,
      filename: input.filename,
    };
    if (input.caption?.trim()) content.caption = input.caption.trim();
    const data = await this.requestJson('POST', '/whatsapp/1/message/document', {
      from,
      to: this.digits(input.to),
      content,
    });
    return { messageId: this.firstMessageId(data) };
  }

  async sendWhatsAppImage(input: {
    to: string;
    mediaUrl: string;
    caption?: string;
  }): Promise<{ messageId: string | null }> {
    const from = this.whatsappFrom();
    if (!from) throw new Error('INFOBIP_WHATSAPP_FROM is not set');
    const content: Record<string, string> = { mediaUrl: input.mediaUrl };
    if (input.caption?.trim()) content.caption = input.caption.trim();
    const data = await this.requestJson('POST', '/whatsapp/1/message/image', {
      from,
      to: this.digits(input.to),
      content,
    });
    return { messageId: this.firstMessageId(data) };
  }

  async sendWhatsAppTemplate(input: {
    to: string;
    templateName: string;
    language?: string;
    placeholders?: string[];
  }): Promise<{ messageId: string | null }> {
    const from = this.whatsappFrom();
    if (!from) throw new Error('INFOBIP_WHATSAPP_FROM is not set');
    const data = await this.requestJson('POST', '/whatsapp/1/message/template', {
      from,
      to: this.digits(input.to),
      content: {
        templateName: input.templateName,
        templateData: {
          body: { placeholders: input.placeholders ?? [] },
        },
        language: input.language || 'en',
      },
    });
    return { messageId: this.firstMessageId(data) };
  }

  private digits(raw: string): string {
    return raw.replace(/\D/g, '');
  }

  private firstMessageId(data: unknown): string | null {
    if (!data || typeof data !== 'object') return null;
    const rec = data as Record<string, unknown>;
    const messages = rec.messages;
    if (Array.isArray(messages) && messages[0] && typeof messages[0] === 'object') {
      const id = (messages[0] as { messageId?: string }).messageId;
      if (id) return String(id);
    }
    if (typeof rec.messageId === 'string') return rec.messageId;
    return null;
  }

  private async requestJson(
    method: 'POST',
    path: string,
    body: FormData | Record<string, unknown>,
  ): Promise<unknown> {
    if (!this.apiKey()) throw new Error('INFOBIP_API_KEY is not set');
    const isForm = body instanceof FormData;
    const res = await fetch(`${this.baseUrl()}${path}`, {
      method,
      headers: isForm ? this.authHeaders(false) : this.authHeaders(true),
      body: isForm ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = { raw: text };
    }
    if (!res.ok) {
      throw new Error(this.errorMessage(parsed, res.status, text));
    }
    const errText = this.serviceException(parsed);
    if (errText) throw new Error(errText);
    return parsed;
  }

  private serviceException(parsed: unknown): string | null {
    if (!parsed || typeof parsed !== 'object') return null;
    const req = (parsed as { requestError?: { serviceException?: { text?: string } } })
      .requestError?.serviceException?.text;
    return req?.trim() || null;
  }

  private errorMessage(parsed: unknown, status: number, raw: string): string {
    const service = this.serviceException(parsed);
    if (service) return service;
    const slice = raw.replace(/\s+/g, ' ').trim().slice(0, 240);
    return `Infobip HTTP ${status}${slice ? `: ${slice}` : ''}`;
  }
}
