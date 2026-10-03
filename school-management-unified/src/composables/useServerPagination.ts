import { computed, ref, shallowRef, watch, type Ref } from 'vue'

/** Envelope every paged list endpoint returns under `data`. */
export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface UseServerPaginationOptions<F> {
  /** Reactive filter values; any change resets to page 1 and refetches. */
  filters?: Ref<F> | (() => F)
  /** Filter keys that are typed by the user; changes to these are debounced. */
  debounceKeys?: (keyof F)[]
  debounceMs?: number
  pageSize?: number
  /** When false, nothing is fetched until `reload()` is called or it turns true. */
  enabled?: Ref<boolean> | (() => boolean)
  /** Called when the fetch throws; the previous page is kept. */
  onError?: (err: unknown) => void
}

/**
 * Server-side counterpart of useClientPagination: same pagination surface
 * (currentPage/totalPages/goToPage/…) but `items` is the page the API returned,
 * so the browser never downloads the whole table. Filters live on the server;
 * the composable only forwards them on every request.
 */
export function useServerPagination<T, F extends Record<string, unknown> = Record<string, never>>(
  fetcher: (params: { page: number; limit: number } & F) => Promise<PageResult<T>>,
  options: UseServerPaginationOptions<F> = {},
) {
  const pageSize = ref(options.pageSize ?? 20)
  const pageSizeOptions = [10, 20, 50]
  const currentPage = ref(1)
  const total = ref(0)
  const totalPages = ref(1)
  const items = shallowRef<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref('')

  const readFilters = (): F => {
    const src = options.filters
    if (!src) return {} as F
    return typeof src === 'function' ? src() : src.value
  }
  const isEnabled = (): boolean => {
    const src = options.enabled
    if (src == null) return true
    return typeof src === 'function' ? src() : src.value
  }

  let requestSeq = 0
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  async function load(opts?: { silent?: boolean }): Promise<void> {
    if (!isEnabled()) return
    const seq = ++requestSeq
    if (!opts?.silent) loading.value = true
    error.value = ''
    try {
      const result = await fetcher({ page: currentPage.value, limit: pageSize.value, ...readFilters() })
      if (seq !== requestSeq) return // a newer request superseded this one
      items.value = result.items ?? []
      total.value = Number(result.total) || 0
      totalPages.value = Math.max(1, Number(result.pages) || 1)
      // The server clamps an over-shot page (e.g. after deleting the last row on the last page).
      if (result.page && result.page !== currentPage.value) currentPage.value = result.page
      loaded.value = true
    } catch (err) {
      if (seq !== requestSeq) return
      error.value = (err as { message?: string })?.message || 'Failed to load'
      options.onError?.(err)
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  /** Refetch the current page (after create/update/delete). */
  function reload(opts?: { silent?: boolean }) {
    return load(opts)
  }

  /** Jump to page 1 and refetch (after filters change). */
  function resetAndLoad() {
    if (currentPage.value !== 1) {
      currentPage.value = 1 // the page watcher fetches
      return
    }
    void load()
  }

  const paginationFrom = computed(() => (total.value ? (currentPage.value - 1) * pageSize.value + 1 : 0))
  const paginationTo = computed(() =>
    total.value ? Math.min(currentPage.value * pageSize.value, total.value) : 0,
  )

  /** Up to 3 consecutive page numbers centered on the current page. */
  const visiblePages = computed(() => {
    const count = Math.max(1, totalPages.value)
    const current = Math.min(Math.max(1, currentPage.value), count)
    if (count <= 3) return Array.from({ length: count }, (_, i) => i + 1)
    let start = current - 1
    if (start < 1) start = 1
    if (start + 2 > count) start = count - 2
    return [start, start + 1, start + 2]
  })

  function goToPage(page: number) {
    const n = Number(page)
    const next = Number.isFinite(n)
      ? Math.min(Math.max(1, Math.trunc(n)), Math.max(1, totalPages.value))
      : 1
    if (next === currentPage.value) return
    currentPage.value = next
  }
  function goToPreviousPage() {
    goToPage(currentPage.value - 1)
  }
  function goToNextPage() {
    goToPage(currentPage.value + 1)
  }

  watch(currentPage, () => void load())
  watch(pageSize, () => resetAndLoad())

  if (options.filters) {
    const debounced = new Set<string>((options.debounceKeys ?? []) as string[])
    const wait = options.debounceMs ?? 300
    watch(
      () => ({ ...readFilters() }),
      (next, prev) => {
        const changedKeys = Object.keys({ ...prev, ...next }).filter((k) => next[k] !== prev?.[k])
        if (!changedKeys.length) return
        const onlyTyped = changedKeys.every((k) => debounced.has(k))
        if (debounceTimer) clearTimeout(debounceTimer)
        if (onlyTyped) {
          debounceTimer = setTimeout(resetAndLoad, wait)
        } else {
          resetAndLoad()
        }
      },
    )
  }

  if (options.enabled) {
    watch(isEnabled, (on) => {
      if (on) void load()
    })
  }

  if (isEnabled()) void load()

  return {
    items,
    total,
    loading,
    loaded,
    error,
    currentPage,
    pageSize,
    pageSizeOptions,
    totalPages,
    visiblePages,
    paginationFrom,
    paginationTo,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    load,
    reload,
    resetAndLoad,
  }
}

/**
 * Walks every page of a paged endpoint (for exports/printing). Bounded by
 * `maxRows` so a runaway list cannot hang the browser.
 */
export async function fetchAllPages<T, F extends Record<string, unknown>>(
  fetcher: (params: { page: number; limit: number } & F) => Promise<PageResult<T>>,
  filters: F,
  maxRows = 5000,
): Promise<T[]> {
  const limit = 100
  const out: T[] = []
  let page = 1
  for (;;) {
    const res = await fetcher({ page, limit, ...filters })
    out.push(...(res.items ?? []))
    if (page >= (res.pages || 1) || !res.items?.length || out.length >= maxRows) break
    page += 1
  }
  return out
}
