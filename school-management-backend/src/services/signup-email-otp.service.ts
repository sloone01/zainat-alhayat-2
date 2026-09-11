import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';

const OTP_TTL_MS = 10 * 60 * 1000;
const VERIFY_TOKEN_TTL_MS = 30 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const DEV_OTP = '000000';

type OtpRecord = {
  codeHash: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
  verificationToken?: string;
  verificationExpiresAt?: number;
};

function isNonProduction(): boolean {
  return process.env.NODE_ENV !== 'production';
}

function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

@Injectable()
export class SignupEmailOtpService {
  private readonly logger = new Logger(SignupEmailOtpService.name);
  private readonly byEmail = new Map<string, OtpRecord>();

  constructor(private readonly notifications: NotificationDispatcherService) {}

  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async sendOtp(rawEmail: string): Promise<{
    expires_in_seconds: number;
    resend_after_seconds: number;
    development_otp?: string;
  }> {
    const email = this.normalizeEmail(rawEmail);
    if (!email) {
      throw new BadRequestException('email is required');
    }

    const now = Date.now();
    const existing = this.byEmail.get(email);
    if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
      throw new HttpException(
        `Please wait ${waitSec} seconds before requesting another code.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = isNonProduction() ? DEV_OTP : String(randomInt(0, 1_000_000)).padStart(6, '0');
    const record: OtpRecord = {
      codeHash: hashValue(`${email}:${code}`),
      expiresAt: now + OTP_TTL_MS,
      lastSentAt: now,
      attempts: 0 };
    this.byEmail.set(email, record);

    if (isNonProduction()) {
      this.logger.warn(`Signup email OTP for ${email} (dev): ${code}`);
    }

    // Do not await SMTP — Gmail STARTTLS on :587 often exceeds the SPA's 10s axios timeout.
    void this.notifications
      .notifySafe({
        schoolId: null,
        templateKey: NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SIGNUP_EMAIL_OTP,
        locale: 'ar',
        channels: ['email'],
        variables: {
          recipientName: email,
          email,
          otpCode: code,
          expiresMinutes: String(Math.round(OTP_TTL_MS / 60000)),
        },
        recipients: [{ email, name: email }],
      })
      .then((sent) => {
        if (sent.errors.length) {
          this.logger.error(`Signup OTP email failed for ${email}: ${sent.errors.join('; ')}`);
        } else if (sent.emailSent === 0) {
          this.logger.warn(`Signup OTP email skipped for ${email}`);
        }
      });

    const result: {
      expires_in_seconds: number;
      resend_after_seconds: number;
      development_otp?: string;
    } = {
      expires_in_seconds: Math.round(OTP_TTL_MS / 1000),
      resend_after_seconds: Math.round(RESEND_COOLDOWN_MS / 1000) };
    if (isNonProduction()) {
      result.development_otp = DEV_OTP;
    }
    return result;
  }

  verifyOtp(
    rawEmail: string,
    code: string,
  ): { email_verification_token: string; expires_in_seconds: number } {
    const email = this.normalizeEmail(rawEmail);
    const trimmed = String(code || '').trim();
    if (!/^\d{6}$/.test(trimmed)) {
      throw new BadRequestException('Enter the 6-digit verification code.');
    }

    const record = this.byEmail.get(email);
    const now = Date.now();
    if (!record || now > record.expiresAt) {
      throw new BadRequestException('Verification code expired. Request a new one.');
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      throw new BadRequestException('Too many attempts. Request a new code.');
    }

    record.attempts += 1;
    const expected = hashValue(`${email}:${trimmed}`);
    if (!safeEqualHex(record.codeHash, expected)) {
      this.byEmail.set(email, record);
      throw new BadRequestException('Invalid verification code.');
    }

    const token = randomBytes(32).toString('base64url');
    record.verificationToken = token;
    record.verificationExpiresAt = now + VERIFY_TOKEN_TTL_MS;
    // Invalidate OTP reuse after successful verify
    record.expiresAt = now;
    this.byEmail.set(email, record);

    return {
      email_verification_token: token,
      expires_in_seconds: Math.round(VERIFY_TOKEN_TTL_MS / 1000) };
  }

  /** Throws if the token is missing/expired/mismatched. Does not consume. */
  assertVerificationToken(rawEmail: string, token: string): void {
    const email = this.normalizeEmail(rawEmail);
    const provided = String(token || '').trim();
    if (!provided) {
      throw new BadRequestException('Email verification is required.');
    }

    const record = this.byEmail.get(email);
    const now = Date.now();
    if (
      !record?.verificationToken ||
      !record.verificationExpiresAt ||
      now > record.verificationExpiresAt
    ) {
      throw new BadRequestException('Verify your email before submitting registration.');
    }
    if (record.verificationToken !== provided) {
      throw new BadRequestException('Email verification is invalid or expired.');
    }
  }

  /** One-time consume after a successful verification gate (call after uniqueness checks). */
  consumeVerificationToken(rawEmail: string, token: string): void {
    this.assertVerificationToken(rawEmail, token);
    this.byEmail.delete(this.normalizeEmail(rawEmail));
  }
}
