import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const LETTER_APPROVAL_PURPOSE = 'letter_approval' as const;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type LetterApprovalTokenClaims = {
  purpose: typeof LETTER_APPROVAL_PURPOSE;
  uid: string;
  mid: string;
};

export function isLetterApprovalPayload(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false;
  return (payload as { purpose?: unknown }).purpose === LETTER_APPROVAL_PURPOSE;
}

export function signLetterApprovalToken(
  jwt: JwtService,
  input: { userId: string; messageId: string },
): string {
  const claims: LetterApprovalTokenClaims = {
    purpose: LETTER_APPROVAL_PURPOSE,
    uid: input.userId,
    mid: input.messageId,
  };
  return jwt.sign(claims, { expiresIn: '30d' });
}

export function verifyLetterApprovalToken(
  jwt: JwtService,
  token: string,
): LetterApprovalTokenClaims {
  const raw = token?.trim();
  if (!raw) throw new BadRequestException('Invalid or expired approval link');
  let payload: unknown;
  try {
    payload = jwt.verify(raw);
  } catch {
    throw new BadRequestException('Invalid or expired approval link');
  }
  if (!isLetterApprovalPayload(payload)) {
    throw new BadRequestException('Invalid or expired approval link');
  }
  const uid = String((payload as { uid?: unknown }).uid || '');
  const mid = String((payload as { mid?: unknown }).mid || '');
  if (!UUID_RE.test(uid) || !UUID_RE.test(mid)) {
    throw new BadRequestException('Invalid or expired approval link');
  }
  if ((payload as { sub?: unknown }).sub) {
    throw new BadRequestException('Invalid or expired approval link');
  }
  return { purpose: LETTER_APPROVAL_PURPOSE, uid, mid };
}

export function publicAppOrigin(raw?: string | null): string {
  const fallback = 'http://localhost:5173';
  const trimmed = (raw || fallback).trim().replace(/\/+$/, '');
  return trimmed || fallback;
}

export function letterApprovalPageUrls(
  appOrigin: string,
  token: string,
): { actionUrl: string; approveUrl: string; rejectUrl: string } {
  const encoded = encodeURIComponent(token);
  const actionUrl = `${appOrigin}/letter-approval?t=${encoded}`;
  return {
    actionUrl,
    approveUrl: `${actionUrl}&d=approve`,
    rejectUrl: `${actionUrl}&d=reject`,
  };
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function insertBeforeMatchingDivClose(
  html: string,
  className: string,
  insert: string,
): string | null {
  const openRe = new RegExp(
    `<div\\b[^>]*\\bclass\\s*=\\s*(["'])[^"']*\\b${className}\\b[^"']*\\1[^>]*>`,
    'i',
  );
  const open = openRe.exec(html);
  if (!open || open.index == null) return null;
  const tagRe = /<\/?div\b[^>]*>/gi;
  tagRe.lastIndex = open.index + open[0].length;
  let depth = 1;
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(html))) {
    const tag = match[0];
    if (/^<\/div/i.test(tag)) {
      depth -= 1;
      if (depth === 0) {
        return html.slice(0, match.index) + insert + html.slice(match.index);
      }
      continue;
    }
    if (!/\/>\s*$/.test(tag)) depth += 1;
  }
  return null;
}

export function appendLetterApprovalActionButtons(
  html: string,
  urls: { approveUrl: string; rejectUrl: string },
  locale: 'en' | 'ar',
): string {
  const isAr = locale === 'ar';
  const approve = isAr ? 'موافقة' : 'Approve';
  const reject = isAr ? 'رفض' : 'Reject';
  const block = `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:20px 0 8px;width:100%;">
  <tr>
    <td align="center" style="padding:6px;">
      <a href="${escapeHtmlAttr(urls.approveUrl)}" style="display:inline-block;background:#00A19B;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700;font-size:15px;">${approve}</a>
    </td>
    <td align="center" style="padding:6px;">
      <a href="${escapeHtmlAttr(urls.rejectUrl)}" style="display:inline-block;background:#ffffff;color:#b42318;border:1px solid #f2b8b5;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700;font-size:15px;">${reject}</a>
    </td>
  </tr>
</table>`;
  const source = html ?? '';
  const inBody = insertBeforeMatchingDivClose(source, 'nt-email-body', block);
  if (inBody) return inBody;
  const inCard = insertBeforeMatchingDivClose(source, 'nt-email-card', block);
  if (inCard) return inCard;
  if (/<\/body>/i.test(source)) {
    return source.replace(/<\/body>/i, `${block}</body>`);
  }
  return `${source}${block}`;
}
