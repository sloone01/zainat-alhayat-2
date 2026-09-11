import { existsSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { uploadsRoot } from '../common/security/runtime-secrets';
import { SCHOOL_LOGO_CID } from './school-notification-branding';
import type { NotifyRequest } from './notification.types';

type Attachment = NonNullable<NotifyRequest['attachments']>[number];

function guessContentType(nameOrUrl: string): string {
  const lower = nameOrUrl.toLowerCase();
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg';
  if (lower.includes('.gif')) return 'image/gif';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.svg')) return 'image/svg+xml';
  return 'image/png';
}

function localPathFromLogoUrl(logoUrl: string): string | null {
  const raw = logoUrl.trim();
  if (!raw || /^(https?:|data:|cid:)/i.test(raw)) return null;
  const cleaned = raw.replace(/^\/+/, '');
  const underUploads = cleaned.startsWith('uploads/')
    ? join(process.cwd(), cleaned)
    : join(uploadsRoot(), cleaned.replace(/^uploads\//, ''));
  const candidates = [
    underUploads,
    join(process.cwd(), cleaned),
    join(process.cwd(), 'uploads', basename(cleaned)),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; contentType: string } | null {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/i);
  if (!m) return null;
  try {
    return { buffer: Buffer.from(m[2], 'base64'), contentType: m[1] || 'image/png' };
  } catch {
    return null;
  }
}

/**
 * Build an inline CID attachment for a school logo so email clients (Gmail) show it
 * even when PUBLIC_APP_URL is localhost or remote images are blocked.
 */
export async function schoolLogoCidAttachment(logoUrl: string): Promise<Attachment | null> {
  const raw = logoUrl.trim();
  if (!raw) return null;

  if (/^cid:/i.test(raw)) {
    return null;
  }

  if (/^data:/i.test(raw)) {
    const parsed = dataUrlToBuffer(raw);
    if (!parsed) return null;
    return {
      filename: 'school-logo.png',
      content: parsed.buffer,
      cid: SCHOOL_LOGO_CID,
      contentType: parsed.contentType,
      contentDisposition: 'inline',
    };
  }

  const local = localPathFromLogoUrl(raw);
  if (local) {
    try {
      return {
        filename: basename(local) || 'school-logo.png',
        content: readFileSync(local),
        cid: SCHOOL_LOGO_CID,
        contentType: guessContentType(local),
        contentDisposition: 'inline',
      };
    } catch {
      return null;
    }
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      const res = await fetch(raw);
      if (!res.ok) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length) return null;
      const contentType =
        res.headers.get('content-type')?.split(';')[0]?.trim() || guessContentType(raw);
      return {
        filename: 'school-logo.png',
        content: buf,
        cid: SCHOOL_LOGO_CID,
        contentType,
        contentDisposition: 'inline',
      };
    } catch {
      return null;
    }
  }

  return null;
}
