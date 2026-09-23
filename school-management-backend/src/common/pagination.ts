/**
 * Shared server-side paging contract. Every list endpoint answers paged when the
 * request carries `page`, otherwise it keeps its legacy array response, so old
 * callers stay compatible while screens migrate off client-side pagination.
 */
export interface PageQuery {
  page?: number | string;
  limit?: number | string;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

/** True when the caller asked for the paged response shape. */
export function wantsPage(page: unknown): boolean {
  return page != null && String(page).trim() !== '';
}

/** Clamps page/limit to sane bounds (page >= 1, 1 <= limit <= MAX_PAGE_LIMIT). */
export function parsePageQuery(
  query: PageQuery,
  defaultLimit = DEFAULT_PAGE_LIMIT,
): { page: number; limit: number } {
  const page = Math.max(1, Math.trunc(Number(query.page)) || 1);
  const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, Math.trunc(Number(query.limit)) || defaultLimit));
  return { page, limit };
}

/** Builds the envelope; `page` is clamped to the last page so an over-shot request is not empty. */
export function buildPage<T>(items: T[], total: number, page: number, limit: number): PageResult<T> {
  const pages = Math.max(1, Math.ceil(total / limit) || 1);
  return { items, total, page: Math.min(page, pages), limit, pages };
}

/** Last page that still has rows, for computing the offset before fetching. */
export function clampPage(page: number, total: number, limit: number): number {
  const pages = Math.max(1, Math.ceil(total / limit) || 1);
  return Math.min(page, pages);
}

/** Lower-cased LIKE term, or null when the search is blank. */
export function likeTerm(q: string | undefined | null): string | null {
  const trimmed = (q || '').trim().toLowerCase();
  return trimmed ? `%${trimmed}%` : null;
}
