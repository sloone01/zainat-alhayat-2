import { existsSync } from 'fs';
import { join } from 'path';
import { FIKR_LOGO_CID } from './school-notification-branding';
import type { NotifyRequest } from './notification.types';

export function resolveFikrLogoFilePath(): string | null {
  const candidates = [
    join(process.cwd(), 'src/assets/email/fikr-logo.png'),
    join(process.cwd(), 'dist/assets/email/fikr-logo.png'),
    join(process.cwd(), 'assets/email/fikr-logo.png'),
    join(__dirname, '../assets/email/fikr-logo.png'),
    join(__dirname, 'assets/email/fikr-logo.png'),
    join(process.cwd(), '../school-management-unified/public/fikr-logo.png'),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

export function fikrLogoCidAttachment(): NonNullable<NotifyRequest['attachments']>[number] | null {
  const path = resolveFikrLogoFilePath();
  if (!path) return null;
  return {
    filename: 'fikr-logo.png',
    path,
    cid: FIKR_LOGO_CID,
    contentType: 'image/png',
    contentDisposition: 'inline',
  };
}
