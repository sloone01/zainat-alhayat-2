import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

export type ThawaniSessionResult = {
  session_id: string;
  checkout_url: string;
};

export type ThawaniSessionStatus = {
  session_id: string;
  payment_status: string;
  invoice?: string | null;
  client_reference_id?: string | null;
};

/**
 * Thawani Checkout API (UAT vs live is env-only).
 * Amounts are sent in baisas (1 OMR = 1000 baisas).
 */
@Injectable()
export class ThawaniService {
  private readonly logger = new Logger(ThawaniService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  /** Super-admin switch (platform_settings.thawani_enabled). Defaults to on when unset. */
  async isEnabled(): Promise<boolean> {
    try {
      const rows: Array<{ value: unknown }> = await this.dataSource.query(
        `SELECT value FROM platform_settings WHERE key = 'thawani_enabled'`,
      );
      if (!rows.length) return true;
      return rows[0].value === true || rows[0].value === 'true';
    } catch {
      return true;
    }
  }

  async setEnabled(enabled: boolean, userId?: string | null): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO platform_settings (key, value, updated_by, updated_at)
       VALUES ('thawani_enabled', $1::jsonb, $2, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
      [JSON.stringify(enabled), userId ?? null],
    );
  }

  /** Enabled by super admin AND API keys present. */
  async isAvailable(): Promise<boolean> {
    return this.isConfigured() && (await this.isEnabled());
  }

  async assertEnabled(): Promise<void> {
    if (!(await this.isEnabled())) {
      throw new ServiceUnavailableException('Online payments are disabled by the platform');
    }
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl() && this.secretKey() && this.publishableKey());
  }

  assertConfigured(): void {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('Online payments are not configured (Thawani)');
    }
  }

  omrToBaisas(omr: number): number {
    return Math.round(Number(omr) * 1000);
  }

  checkoutUrl(sessionId: string): string {
    this.assertConfigured();
    return `${this.baseUrl()}/pay/${sessionId}?key=${this.publishableKey()}`;
  }

  async createCheckoutSession(input: {
    clientReferenceId: string;
    productName: string;
    amountOmr: number;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<ThawaniSessionResult> {
    await this.assertEnabled();
    this.assertConfigured();
    const unitAmount = this.omrToBaisas(input.amountOmr);
    if (unitAmount <= 0) {
      throw new ServiceUnavailableException('Payment amount must be greater than zero');
    }

    const res = await fetch(`${this.baseUrl()}/api/v1/checkout/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'thawani-api-key': this.secretKey()!,
        'User-Agent': 'ZinatAlHaya-School/1.0',
      },
      body: JSON.stringify({
        client_reference_id: input.clientReferenceId,
        mode: 'payment',
        products: [{ name: input.productName.slice(0, 120), quantity: 1, unit_amount: unitAmount }],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: input.metadata ?? {},
      }),
      signal: AbortSignal.timeout(20000),
    });

    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      data?: { session_id?: string };
      description?: string;
      error?: string;
    } | null;

    const sessionId = data?.data?.session_id;
    if (!data?.success || !sessionId) {
      this.logger.error(`Thawani session failed (${res.status}): ${JSON.stringify(data)}`);
      throw new ServiceUnavailableException(
        String(data?.description ?? data?.error ?? 'Could not start Thawani checkout'),
      );
    }

    return { session_id: sessionId, checkout_url: this.checkoutUrl(sessionId) };
  }

  async getSession(sessionId: string): Promise<ThawaniSessionStatus> {
    this.assertConfigured();
    const res = await fetch(`${this.baseUrl()}/api/v1/checkout/session/${sessionId}`, {
      headers: {
        'thawani-api-key': this.secretKey()!,
        'User-Agent': 'ZinatAlHaya-School/1.0',
      },
      signal: AbortSignal.timeout(15000),
    });
    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      data?: {
        session_id?: string;
        payment_status?: string;
        invoice?: string;
        client_reference_id?: string;
      };
    } | null;

    return {
      session_id: String(data?.data?.session_id ?? sessionId),
      payment_status: String(data?.data?.payment_status ?? 'unknown'),
      invoice: data?.data?.invoice ?? null,
      client_reference_id: data?.data?.client_reference_id ?? null,
    };
  }

  private baseUrl(): string | undefined {
    return this.config.get<string>('THAWANI_BASE_URL')?.trim().replace(/\/$/, '');
  }

  private secretKey(): string | undefined {
    return this.config.get<string>('THAWANI_SECRET_KEY')?.trim();
  }

  private publishableKey(): string | undefined {
    return this.config.get<string>('THAWANI_PUBLISHABLE_KEY')?.trim();
  }
}
