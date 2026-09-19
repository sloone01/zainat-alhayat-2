const REDACT = /password|token|secret|otp|authorization|cookie/i;

export function formatBizLine(
  action: string,
  userId: string,
  schoolName: string,
  extra?: string,
): string {
  const tail = extra?.trim() ? ` ${extra.trim()}` : '';
  return `****${action}**** user=${userId} school=${schoolName}${tail}`;
}

export function criteriaFromRequest(input: {
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
}): string {
  const parts: string[] = [];
  for (const [key, value] of [
    ...Object.entries(input.params || {}),
    ...Object.entries(input.query || {}),
  ]) {
    if (value == null || value === '') continue;
    if (REDACT.test(key)) {
      parts.push(`${key}=***`);
      continue;
    }
    const raw = Array.isArray(value) ? value.join(',') : String(value);
    if (!raw) continue;
    parts.push(`${key}=${raw.slice(0, 120)}`);
  }
  return parts.length ? `criteria ${parts.join(' ')}` : '';
}

export function resultCountFromPayload(payload: unknown): string {
  if (payload == null) return '';
  if (Array.isArray(payload)) return `resultCount=${payload.length}`;
  if (typeof payload !== 'object') return '';
  const row = payload as Record<string, unknown>;
  const data = row.data;
  if (Array.isArray(data)) return `resultCount=${data.length}`;
  if (data && typeof data === 'object') {
    const inner = data as Record<string, unknown>;
    if (Array.isArray(inner.items)) {
      const total = inner.total != null ? ` total=${inner.total}` : '';
      return `resultCount=${inner.items.length}${total}`;
    }
    if (typeof inner.total === 'number') return `resultCount=${inner.total}`;
  }
  if (Array.isArray(row.items)) {
    const total = row.total != null ? ` total=${row.total}` : '';
    return `resultCount=${row.items.length}${total}`;
  }
  if (typeof row.count === 'number') return `resultCount=${row.count}`;
  return '';
}
