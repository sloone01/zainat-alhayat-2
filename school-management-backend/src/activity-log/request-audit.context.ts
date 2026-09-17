import { AsyncLocalStorage } from 'async_hooks';

export type AuditCheck = {
  name: string;
  checking: string;
  result: string;
};

export type AuditQuery = {
  sql: string;
};

export type AuditStore = {
  checks: AuditCheck[];
  queries: AuditQuery[];
};

const MAX_CHECKS = 40;
const MAX_QUERIES = 60;
const MAX_SQL_CHARS = 8000;

const storage = new AsyncLocalStorage<AuditStore>();

export function runWithRequestAudit<T>(fn: (store: AuditStore) => T): T {
  const store: AuditStore = { checks: [], queries: [] };
  return storage.run(store, () => fn(store));
}

export function recordAuditCheck(input: {
  name: string;
  checking: string;
  result: boolean | string | number | null | undefined;
}): void {
  const store = storage.getStore();
  if (!store || store.checks.length >= MAX_CHECKS) return;
  store.checks.push({
    name: String(input.name).slice(0, 120),
    checking: String(input.checking).slice(0, 500),
    result: formatCheckResult(input.result),
  });
}

export function recordAuditQuery(sql: string): void {
  const store = storage.getStore();
  if (!store || store.queries.length >= MAX_QUERIES) return;
  const trimmed = String(sql || '').trim();
  if (!trimmed) return;
  if (isActivityLogSql(trimmed) || isPasswordWriteSql(trimmed)) return;
  store.queries.push({ sql: trimmed.slice(0, MAX_SQL_CHARS) });
}

export function snapshotRequestAudit(
  store?: AuditStore,
): { checks: AuditCheck[]; queries: AuditQuery[] } {
  const src = store ?? storage.getStore();
  if (!src) return { checks: [], queries: [] };
  return {
    checks: src.checks.slice(),
    queries: src.queries.slice(),
  };
}

function formatCheckResult(result: boolean | string | number | null | undefined): string {
  if (result === true) return 'pass';
  if (result === false) return 'fail';
  if (result == null) return 'null';
  return String(result).slice(0, 300);
}

/** Skip our own writes so the trail does not record itself. */
function isActivityLogSql(sql: string): boolean {
  return /activity_logs/i.test(sql);
}

/**
 * Omit statements that write a password value. SELECTs that only list the
 * column are kept — they do not carry the secret in the SQL string.
 */
export function isPasswordWriteSql(sql: string): boolean {
  const compact = sql.replace(/\s+/g, ' ');
  if (!/(?:^|[^\w])password(?:$|[^\w])/i.test(compact)) return false;
  return /\b(INSERT|UPDATE)\b/i.test(compact);
}
