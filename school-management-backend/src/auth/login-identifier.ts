/** Split a login field into an email and/or normalized phone variants (Oman +968). */
export function loginIdentifierParts(raw: string): { email: string; phones: string[] } {
  const trimmed = String(raw || '').trim();
  const email = trimmed.toLowerCase();
  const digits = trimmed.replace(/\D/g, '');
  const phones = new Set<string>();

  const looksLikeEmail = trimmed.includes('@');
  if (!looksLikeEmail && digits.length >= 8) {
    phones.add(digits);
    if (digits.startsWith('968') && digits.length > 8) phones.add(digits.slice(3));
    if (digits.startsWith('00968') && digits.length > 8) phones.add(digits.slice(5));
    if (!digits.startsWith('968') && digits.length === 8) phones.add(`968${digits}`);
    if (digits.startsWith('0') && digits.length >= 9) phones.add(digits.slice(1));
  }

  return { email, phones: [...phones] };
}
