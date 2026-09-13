import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { Repository } from 'typeorm';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { normalizeNotificationLocale } from '../notifications/notification-locale';
import type { NotificationLocale } from '../notifications/notification.types';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import { SignupEmailOtp } from '../entities/signup-email-otp.entity';
import { MailService } from './mail.service';

const OTP_TTL_MS = 10 * 60 * 1000;
const VERIFY_TOKEN_TTL_MS = 30 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateOtp(): string {
  let code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  while (code === '000000') {
    code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  }
  return code;
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

  constructor(
    @InjectRepository(SignupEmailOtp)
    private readonly otpRepo: Repository<SignupEmailOtp>,
    private readonly notifications: NotificationDispatcherService,
    private readonly mail: MailService,
  ) {}

  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async sendOtp(
    rawEmail: string,
    locale?: string,
  ): Promise<{
    expires_in_seconds: number;
    resend_after_seconds: number;
  }> {
    const email = this.normalizeEmail(rawEmail);
    if (!email) {
      throw new BadRequestException('email is required');
    }
    if (!this.mail.isConfigured()) {
      this.logger.error('Signup OTP email skipped: SMTP is not configured');
      throw new BadRequestException('Could not send the verification code.');
    }

    const now = Date.now();
    const existing = await this.otpRepo.findOne({ where: { email } });
    if (existing && now - existing.last_sent_at.getTime() < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.last_sent_at.getTime())) / 1000);
      throw new HttpException(
        `Please wait ${waitSec} seconds before requesting another code.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = generateOtp();
    const sendLocale: NotificationLocale = normalizeNotificationLocale(locale, 'ar');
    const row: SignupEmailOtp = {
      email,
      code_hash: hashValue(`${email}:${code}`),
      expires_at: new Date(now + OTP_TTL_MS),
      last_sent_at: new Date(now),
      attempts: 0,
      verification_token: null,
      verification_expires_at: null,
    };
    await this.otpRepo.save(row);

    const sent = await this.notifications.notifySafe({
      schoolId: null,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SIGNUP_EMAIL_OTP,
      locale: sendLocale,
      channels: ['email'],
      variables: {
        recipientName: email,
        email,
        otpCode: code,
        expiresMinutes: String(Math.round(OTP_TTL_MS / 60000)),
      },
      recipients: [{ email, name: email, locale: sendLocale }],
    });

    if (sent.errors.length) {
      this.logger.error(`Signup OTP email failed for ${email}: ${sent.errors.join('; ')}`);
    }
    if (sent.emailSent < 1) {
      throw new BadRequestException('Could not send the verification code.');
    }

    return {
      expires_in_seconds: Math.round(OTP_TTL_MS / 1000),
      resend_after_seconds: Math.round(RESEND_COOLDOWN_MS / 1000),
    };
  }

  async verifyOtp(
    rawEmail: string,
    code: string,
  ): Promise<{ email_verification_token: string; expires_in_seconds: number }> {
    const email = this.normalizeEmail(rawEmail);
    const trimmed = String(code || '').trim();
    if (!/^\d{6}$/.test(trimmed) || trimmed === '000000') {
      throw new BadRequestException('Enter the 6-digit verification code.');
    }

    const record = await this.otpRepo.findOne({ where: { email } });
    const now = Date.now();
    if (!record || now > record.expires_at.getTime()) {
      throw new BadRequestException('Verification code expired. Request a new one.');
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      throw new BadRequestException('Too many attempts. Request a new code.');
    }

    record.attempts += 1;
    const expected = hashValue(`${email}:${trimmed}`);
    if (!safeEqualHex(record.code_hash, expected)) {
      await this.otpRepo.save(record);
      throw new BadRequestException('Invalid verification code.');
    }

    const token = randomBytes(32).toString('base64url');
    record.verification_token = token;
    record.verification_expires_at = new Date(now + VERIFY_TOKEN_TTL_MS);
    record.expires_at = new Date(now);
    await this.otpRepo.save(record);

    return {
      email_verification_token: token,
      expires_in_seconds: Math.round(VERIFY_TOKEN_TTL_MS / 1000),
    };
  }

  async assertVerificationToken(rawEmail: string, token: string): Promise<void> {
    const email = this.normalizeEmail(rawEmail);
    const provided = String(token || '').trim();
    if (!provided) {
      throw new BadRequestException('Email verification is required.');
    }

    const record = await this.otpRepo.findOne({ where: { email } });
    const now = Date.now();
    if (
      !record?.verification_token ||
      !record.verification_expires_at ||
      now > record.verification_expires_at.getTime()
    ) {
      throw new BadRequestException('Verify your email before submitting registration.');
    }
    if (record.verification_token !== provided) {
      throw new BadRequestException('Email verification is invalid or expired.');
    }
  }

  async consumeVerificationToken(rawEmail: string, token: string): Promise<void> {
    await this.assertVerificationToken(rawEmail, token);
    await this.otpRepo.delete({ email: this.normalizeEmail(rawEmail) });
  }
}
