import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  LETTER_FILE_PURPOSE,
  type LetterFileTokenClaims,
} from '../../constants/message-letter-files';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function signLetterFileToken(jwt: JwtService, fileId: string): string {
  const claims: LetterFileTokenClaims = { purpose: LETTER_FILE_PURPOSE, fid: fileId };
  return jwt.sign(claims, { expiresIn: '6h' });
}

export function verifyLetterFileToken(jwt: JwtService, token: string): LetterFileTokenClaims {
  const raw = token?.trim();
  if (!raw) throw new BadRequestException('Invalid or expired file link');
  let payload: unknown;
  try {
    payload = jwt.verify(raw);
  } catch {
    throw new BadRequestException('Invalid or expired file link');
  }
  if (!payload || typeof payload !== 'object') {
    throw new BadRequestException('Invalid or expired file link');
  }
  const rec = payload as { purpose?: unknown; fid?: unknown };
  if (rec.purpose !== LETTER_FILE_PURPOSE || typeof rec.fid !== 'string' || !UUID_RE.test(rec.fid)) {
    throw new BadRequestException('Invalid or expired file link');
  }
  return { purpose: LETTER_FILE_PURPOSE, fid: rec.fid };
}
